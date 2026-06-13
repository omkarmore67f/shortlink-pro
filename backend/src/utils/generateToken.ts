import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Generates a signed JWT containing the user's ID.
 *
 * Why only the ID in the payload?
 * - Keeps the token small.
 * - Avoids embedding data (like role/email) that could become stale
 *   if the user updates their profile - the auth middleware always
 *   fetches the fresh user document from the DB using this ID.
 */
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export default generateToken;
