import Url, { IUrl } from '../models/Url';
import ClickEvent from '../models/ClickEvent';
import AppError from '../utils/AppError';
import generateShortCode from '../utils/generateShortCode';
import QRCode from 'qrcode';

interface CreateUrlInput {
  userId: string;
  originalUrl: string;
  customAlias?: string;
  title?: string;
  expiresAt?: string;
}

interface ListUrlsOptions {
  userId: string;
  page: number;
  limit: number;
  sortBy: string;
  order: 'asc' | 'desc';
  search?: string;
}

interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

const MAX_RETRIES = 5;

/**
 * URL Service
 *
 * Handles all business logic for short URL lifecycle: creation,
 * collision-safe code generation, redirect resolution + click
 * tracking, listing/searching, updating, and deletion.
 */
class UrlService {
  /**
   * Creates a new short URL.
   *
   * Collision prevention flow:
   * 1. If a custom alias is provided, check uniqueness explicitly and
   *    fail fast with a friendly message ("alias already taken") if
   *    it's in use - this is a UX requirement (random retries don't
   *    make sense for user-chosen aliases).
   * 2. If no alias is provided, generate a random short code via
   *    nanoid and attempt to save. If MongoDB throws a duplicate-key
   *    error (E11000) on the unique `shortCode` index - which is
   *    extremely unlikely given the keyspace size but theoretically
   *    possible - retry with a freshly generated code, up to
   *    MAX_RETRIES times.
   */
  async createShortUrl(input: CreateUrlInput): Promise<IUrl> {
    const { userId, originalUrl, customAlias, title, expiresAt } = input;

    let shortCode: string;

    if (customAlias) {
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) {
        throw new AppError('This custom alias is already taken. Please choose another.', 400);
      }
      shortCode = customAlias;
    } else {
      shortCode = await this.generateUniqueShortCode();
    }

    let attempts = 0;

    while (attempts < MAX_RETRIES) {
      try {
        const url = await Url.create({
          user: userId,
          originalUrl,
          shortCode,
          customAlias: customAlias || null,
          title,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        return url;
      } catch (error: any) {
        // E11000 = duplicate key error from MongoDB's unique index
        if (error.code === 11000 && !customAlias) {
          shortCode = generateShortCode();
          attempts++;
          continue;
        }
        throw error;
      }
    }

    throw new AppError('Could not generate a unique short code. Please try again.', 500);
  }

  /**
   * Generates a random short code and verifies it doesn't already
   * exist before returning. This pre-check minimizes (but does not
   * eliminate) the chance of hitting the DB unique-index error,
   * which is handled as a final fallback in createShortUrl.
   */
  private async generateUniqueShortCode(): Promise<string> {
    let code = generateShortCode();
    let existing = await Url.findOne({ shortCode: code });

    let attempts = 0;
    while (existing && attempts < MAX_RETRIES) {
      code = generateShortCode();
      existing = await Url.findOne({ shortCode: code });
      attempts++;
    }

    return code;
  }

  /**
   * Resolves a short code to its original URL, validates expiration
   * and active status, increments click counters, and logs a
   * ClickEvent for analytics. Returns the original URL to redirect to.
   */
  async resolveAndTrack(shortCode: string, meta: RequestMeta): Promise<string> {
    const url = await Url.findOne({ shortCode });

    if (!url) {
      throw new AppError('Short link not found.', 404);
    }

    if (!url.isActive) {
      throw new AppError('This link has been deactivated by its owner.', 410);
    }

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      throw new AppError('This link has expired.', 410);
    }

    // Increment denormalized counter (fast read path for dashboard)
    url.totalClicks += 1;
    await url.save();

    // Log detailed click event for analytics (async, fire-and-forget
    // semantics could be used in very high-traffic systems, but we
    // await here for correctness/simplicity in a portfolio project).
    const { device, browser, os } = this.parseUserAgent(meta.userAgent);

    await ClickEvent.create({
      url: url._id,
      user: url.user,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      referrer: meta.referrer || 'direct',
      device,
      browser,
      os,
    });

    return url.originalUrl;
  }

  /**
   * Very lightweight User-Agent parser (no external dependency) that
   * extracts device type, browser, and OS for analytics grouping.
   * For a production system, a library like `ua-parser-js` would be
   * more robust, but this keeps the dependency footprint minimal.
   */
  private parseUserAgent(userAgent?: string): {
    device: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser: string;
    os: string;
  } {
    if (!userAgent) return { device: 'unknown', browser: 'unknown', os: 'unknown' };

    const ua = userAgent.toLowerCase();

    let device: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'desktop';
    if (/tablet|ipad/.test(ua)) device = 'tablet';
    else if (/mobile|android|iphone/.test(ua)) device = 'mobile';

    let browser = 'unknown';
    if (ua.includes('edg')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';

    let os = 'unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac')) os = 'macOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ios')) os = 'iOS';
    else if (ua.includes('linux')) os = 'Linux';

    return { device, browser, os };
  }

  /**
   * Lists URLs for a user with pagination, sorting, and search.
   */
  async listUrls(options: ListUrlsOptions) {
    const { userId, page, limit, sortBy, order, search } = options;

    const filter: Record<string, unknown> = { user: userId };

    if (search) {
      // Case-insensitive partial match on title or originalUrl or shortCode
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: order === 'asc' ? 1 : -1 };

    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      Url.find(filter).sort(sort).skip(skip).limit(limit),
      Url.countDocuments(filter),
    ]);

    return {
      urls,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetches a single URL, ensuring it belongs to the requesting user.
   */
  async getUrlById(id: string, userId: string): Promise<IUrl> {
    const url = await Url.findOne({ _id: id, user: userId });

    if (!url) {
      throw new AppError('Short link not found.', 404);
    }

    return url;
  }

  /**
   * Updates a URL's editable fields.
   */
  async updateUrl(
    id: string,
    userId: string,
    updates: Partial<{
      originalUrl: string;
      title: string;
      isActive: boolean;
      expiresAt: string | null;
    }>
  ): Promise<IUrl> {
    const url = await Url.findOne({ _id: id, user: userId });

    if (!url) {
      throw new AppError('Short link not found.', 404);
    }

    if (updates.originalUrl !== undefined) url.originalUrl = updates.originalUrl;
    if (updates.title !== undefined) url.title = updates.title;
    if (updates.isActive !== undefined) url.isActive = updates.isActive;
    if (updates.expiresAt !== undefined) {
      url.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
    }

    await url.save();

    return url;
  }

  /**
   * Deletes a URL and its associated click events.
   */
  async deleteUrl(id: string, userId: string): Promise<void> {
    const url = await Url.findOne({ _id: id, user: userId });

    if (!url) {
      throw new AppError('Short link not found.', 404);
    }

    await ClickEvent.deleteMany({ url: url._id });
    await url.deleteOne();
  }

  /**
   * Generates a QR code as a base64 Data URL for a given short URL.
   */
  async generateQrCode(shortUrl: string): Promise<string> {
    return QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  }
}

export default new UrlService();
