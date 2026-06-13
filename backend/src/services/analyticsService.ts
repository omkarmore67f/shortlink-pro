import mongoose from 'mongoose';
import Url from '../models/Url';
import ClickEvent from '../models/ClickEvent';

/**
 * Analytics Service
 *
 * All analytics queries are read-heavy aggregations scoped to a single
 * user's data. Each method maps to one widget/section of the dashboard.
 *
 * Performance note: these aggregations rely on the indexes defined in
 * the Url and ClickEvent models (user+createdAt, url+createdAt). For a
 * dashboard that's loaded frequently, these results would be excellent
 * candidates for short-TTL caching (see README "Caching Opportunities").
 */
class AnalyticsService {
  /**
   * High-level summary stats: total links, total clicks, active links,
   * and links created in the last 7 days.
   */
  async getSummary(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [totalLinks, activeLinks, clicksAgg, recentLinks] = await Promise.all([
      Url.countDocuments({ user: userObjectId }),
      Url.countDocuments({ user: userObjectId, isActive: true }),
      Url.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: null, totalClicks: { $sum: '$totalClicks' } } },
      ]),
      Url.countDocuments({
        user: userObjectId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    return {
      totalLinks,
      activeLinks,
      totalClicks: clicksAgg[0]?.totalClicks || 0,
      linksCreatedLast7Days: recentLinks,
    };
  }

  /**
   * Daily click counts for the last N days (default 30), suitable for
   * a line/bar chart. Returns a fully populated array including days
   * with zero clicks (so charts don't show gaps).
   */
  async getDailyClicks(userId: string, days = 30) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const results = await ClickEvent.aggregate([
      {
        $match: {
          user: userObjectId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const map = new Map<string, number>();
    results.forEach((r) => map.set(r._id, r.count));

    const data: { date: string; clicks: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      data.push({ date: key, clicks: map.get(key) || 0 });
    }

    return data;
  }

  /**
   * Top performing links sorted by total clicks (denormalized field
   * on Url, so this is a simple indexed sort - no aggregation needed).
   */
  async getTopLinks(userId: string, limit = 5) {
    return Url.find({ user: userId })
      .sort({ totalClicks: -1 })
      .limit(limit)
      .select('shortCode originalUrl title totalClicks createdAt');
  }

  /**
   * Recent click activity (last N click events) across all of the
   * user's links, with the related URL populated for display.
   */
  async getRecentActivity(userId: string, limit = 10) {
    return ClickEvent.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('url', 'shortCode title originalUrl');
  }

  /**
   * Breakdown of clicks by device type, browser, and OS - useful for
   * pie/donut charts.
   */
  async getDeviceBreakdown(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [byDevice, byBrowser] = await Promise.all([
      ClickEvent.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ClickEvent.aggregate([
        { $match: { user: userObjectId } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      byDevice: byDevice.map((d) => ({ name: d._id, count: d.count })),
      byBrowser: byBrowser.map((d) => ({ name: d._id, count: d.count })),
    };
  }

  /**
   * Per-link analytics: daily click history + breakdown for a single
   * short link (used on the "Link Details" page).
   */
  async getLinkAnalytics(urlId: string, userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const urlObjectId = new mongoose.Types.ObjectId(urlId);

    const dailyClicks = await ClickEvent.aggregate([
      {
        $match: {
          url: urlObjectId,
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]);

    const map = new Map<string, number>();
    dailyClicks.forEach((r) => map.set(r._id, r.count));

    const data: { date: string; clicks: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      data.push({ date: key, clicks: map.get(key) || 0 });
    }

    return data;
  }
}

export default new AnalyticsService();
