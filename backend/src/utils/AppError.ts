/**
 * Custom application error class.
 *
 * Why: Distinguishes "operational errors" (expected, e.g. "URL not found",
 * "Invalid credentials") from programming errors (bugs, unhandled
 * exceptions). The global error handler middleware uses `isOperational`
 * to decide whether to send the error message to the client directly
 * or hide it behind a generic "Something went wrong" message.
 */
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Excludes constructor call from stack trace for cleaner debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
