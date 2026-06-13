import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User document interface.
 * Extends mongoose.Document to get _id, timestamps, etc.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Schema
 *
 * Design decisions:
 * - email has a unique index because it's our login identifier and
 *   the most frequent lookup field (login, registration check).
 * - password is select:false so it is NEVER returned by default in
 *   queries (e.g., GET /profile). We explicitly .select('+password')
 *   only during login.
 * - role enables a simple RBAC extension point (admin dashboards,
 *   future moderation features) without schema migration later.
 * - timestamps:true gives us createdAt/updatedAt automatically, useful
 *   for "member since" on profile pages and analytics.
 */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook: hash password before persisting.
 * Only runs if the password field was modified (avoids re-hashing
 * an already-hashed password on unrelated profile updates).
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method to compare plaintext password with hashed password.
 * Kept on the model so controllers never deal with bcrypt directly.
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
