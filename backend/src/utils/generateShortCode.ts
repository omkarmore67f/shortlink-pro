import { customAlphabet } from 'nanoid';

/**
 * Short code generation strategy
 * ================================
 *
 * We use `nanoid`'s customAlphabet generator with a URL-safe alphabet
 * (alphanumeric, mixed case, no ambiguous-looking characters removed
 * for simplicity here, but could be tightened further).
 *
 * Why nanoid over alternatives:
 * - Cryptographically strong randomness (uses crypto.randomBytes
 *   under the hood), unlike Math.random()-based generators.
 * - Significantly smaller and faster than UUID, and produces much
 *   shorter strings (7 chars vs 36 for UUID) - critical for a URL
 *   shortener where brevity is the entire point.
 * - customAlphabet lets us restrict output to characters that are
 *   safe in URLs without percent-encoding.
 *
 * Collision probability:
 * - With a 7-character code from a 62-character alphabet, the
 *   keyspace is 62^7 ≈ 3.5 trillion combinations. Even at 1 million
 *   generated codes, the birthday-paradox collision probability is
 *   astronomically small (~1.4 x 10^-7).
 *
 * Collision PREVENTION strategy (defense in depth):
 * 1. The `shortCode` field in the Url model has a UNIQUE index at the
 *    database level - MongoDB will reject a duplicate insert with an
 *    E11000 error.
 * 2. The service layer (urlService.createShortUrl) catches that
 *    duplicate-key error and retries generation up to MAX_RETRIES
 *    times, generating a fresh code each time.
 * 3. For custom aliases, we explicitly check existence BEFORE insert
 *    (since users expect a friendly "alias already taken" message,
 *    not a generic 500 error).
 */
const ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const SHORT_CODE_LENGTH = 7;

const nanoid = customAlphabet(ALPHABET, SHORT_CODE_LENGTH);

/**
 * Generates a new random short code.
 */
export const generateShortCode = (): string => {
  return nanoid();
};

export default generateShortCode;
