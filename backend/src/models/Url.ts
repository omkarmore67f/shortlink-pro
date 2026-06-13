import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/**
 * Url document interface.
 */
export interface IUrl extends Document {
  user: Types.ObjectId;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  title?: string;
  totalClicks: number;
  isActive: boolean;
  expiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Url Schema
 *
 * Design decisions:
 * - shortCode has a UNIQUE index. This is the single most important
 *   index in the entire system: every redirect request
 *   (GET /:shortCode) does an exact-match lookup on this field.
 *   With a unique index, MongoDB can serve this lookup in O(log n)
 *   via the B-tree index rather than scanning the collection.
 * - customAlias is stored separately from shortCode. When a user
 *   provides a custom alias, we store it AS the shortCode (so the
 *   redirect lookup logic stays simple - always query by shortCode),
 *   but we keep customAlias as a boolean-ish flag/value for UI display
 *   ("Custom" badge) and to allow future alias-specific validation.
 * - user field is indexed (via compound index below) because the
 *   dashboard's primary query is "all URLs belonging to user X,
 *   sorted by createdAt desc".
 * - expiresAt is a plain Date (nullable). We do NOT use MongoDB's TTL
 *   index here because TTL indexes physically DELETE documents, but
 *   we want expired links to remain visible in the dashboard (marked
 *   "Expired") rather than silently disappearing. Expiration is
 *   instead checked at redirect-time in the service layer.
 * - totalClicks is denormalized onto the Url document itself (in
 *   addition to the detailed ClickEvent collection) so that listing
 *   URLs for the dashboard does NOT require a join/aggregation on
 *   every page load - it's an O(1) read. ClickEvent remains the
 *   source of truth for detailed analytics (daily charts, geo, etc.).
 */
const urlSchema = new Schema<IUrl>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    customAlias: {
      type: String,
      default: null,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index: speeds up "fetch this user's links sorted by newest first"
// which is the primary query on the dashboard's link table.
urlSchema.index({ user: 1, createdAt: -1 });

// Index to support filtering/sorting by click count ("Top Performing Links")
urlSchema.index({ user: 1, totalClicks: -1 });

const Url: Model<IUrl> = mongoose.model<IUrl>('Url', urlSchema);

export default Url;
