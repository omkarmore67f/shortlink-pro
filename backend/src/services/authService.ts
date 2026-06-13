import User, { IUser } from '../models/User';
import AppError from '../utils/AppError';
import generateToken from '../utils/generateToken';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: Partial<IUser>;
  token: string;
}

/**
 * Auth Service
 *
 * Contains all business logic related to authentication, kept separate
 * from the controller layer so that:
 * - Controllers stay thin (parse request -> call service -> send response)
 * - Logic is independently unit-testable without mocking req/res
 * - Logic could be reused (e.g., by an admin script or CLI tool)
 */
class AuthService {
  /**
   * Registers a new user and returns a JWT.
   */
  async register({ name, email, password }: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 400);
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id.toString());

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Authenticates a user and returns a JWT.
   */
  async login({ email, password }: LoginInput): Promise<AuthResult> {
    // Explicitly select password since the schema excludes it by default
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = generateToken(user._id.toString());

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Fetches the current user's profile by ID.
   */
  async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Updates name/email on the user's profile.
   */
  async updateProfile(
    userId: string,
    updates: { name?: string; email?: string }
  ): Promise<Partial<IUser>> {
    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existing) {
        throw new AppError('This email is already in use by another account.', 400);
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Changes the user's password after verifying the current one.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 401);
    }

    user.password = newPassword;
    await user.save();
  }

  /**
   * Strips sensitive/internal fields before sending user data to client.
   */
  private sanitizeUser(user: IUser): Partial<IUser> {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    } as Partial<IUser>;
  }
}

export default new AuthService();
