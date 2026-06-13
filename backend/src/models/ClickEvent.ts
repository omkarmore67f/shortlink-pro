import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * ClickEvent document interface.
 *
 * Each redirect (successful click on a short link) inserts ONE
 * ClickEvent document. This is an append-only "event log" collection.
 */
export interface IClickEvent extends Document {
  url: Types.ObjectId;
  user: Types.ObjectId;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  device?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  os?: string;
  country?: string;
  createdAt: Date;
}

/**
 * ClickEvent Schema
 *
 * Design decisions:
 * - This collection is intentionally separate from Url so that
 *   write-heavy click logging (potentially thousands of inserts/sec
 *   in a real product) never locks or contends with the much
 *   smaller, read-heavy Url collection.
 * - `url` and `user` are both indexed because analytics queries are
 *   always scoped to "clicks for link X" or "clicks across all of
 *   user Y's links".
 * - A compound index on (url, createdAt) supports the "daily click
 *   stats for this link over the last 30 days" aggregation
 *   (date-range queries grouped/sorted by time).
 * - We deliberately do NOT store full IP addresses in plaintext in a
 *   production system (privacy/GDPR) - here it's optional and meant
 *   for portfolio/demo purposes. In production this would be hashed
 *   or anonymized (e.g., zero out the last octet).
 * - device/browser/os/country are denormalized strings (not refs)
 *   because they're derived once at click-time from the User-Agent
 *   string via a parsing library, and never need to be queried by ID
 *   or joined - just grouped/counted in aggregations.
 */
const clickEventSchema = new Schema<IClickEvent>(
  {
    url: {
      type: Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    referrer: {
      type: String,
      default: 'direct',
    },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown',
    },
    browser: {
      type: String,
      default: 'unknown',
    },
    os: {
      type: String,
      default: 'unknown',
    },
    country: {
      type: String,
      default: 'unknown',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for time-series style queries:
// "give me all clicks for url X between date A and date B"
clickEventSchema.index({ url: 1, createdAt: -1 });
clickEventSchema.index({ user: 1, createdAt: -1 });

const ClickEvent: Model<IClickEvent> = mongoose.model<IClickEvent>(
  'ClickEvent',
  clickEventSchema
);

export default ClickEvent;
