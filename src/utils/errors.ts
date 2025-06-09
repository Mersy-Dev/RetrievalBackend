import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class to handle application-specific errors.
 * Extends the built-in Error class to include statusCode, isOperational, and userMessage.
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  userMessage: string;

  /**
   * Creates an instance of AppError.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code associated with the error.
   * @param {boolean} [isOperational=true] - Flag to indicate if the error is operational (i.e., expected behavior).
   * @param {string} [userMessage] - A user-friendly message to be sent to the client (optional).
   */
  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true,
    userMessage?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.userMessage = userMessage || message; // Default to the error message if no user message is provided
    Error.captureStackTrace(this, this.constructor); // Captures the stack trace for debugging
  }
}

/**
 * Error handling middleware for Express applications.
 * Handles errors and sends consistent responses to the client.
 * Logs errors for developers, including operational and non-operational errors.
 *
 * @param {AppError} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function in the Express pipeline.
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Log the detailed error for developers to investigate further
  console.error('Developer Error (Global Handler):', err);

  // Set the HTTP status code based on the error or default to 500 if not provided
  const statusCode = err.statusCode || 500;

  // Determine the message to be sent to the client:
  // - If it's an operational error, send the developer message.
  // - For non-operational errors, send a generic message.
  const message = err.isOperational
    ? err.message // Developer message for operational errors
    : 'Something went wrong. Please try again or contact support if the issue persists.'; // Default message for non-operational errors

  // Choose a user-friendly message (either from the error object or default to the message)
  const userMessage = err.userMessage || message;

  // Optionally, log non-operational errors to an external logging service (like Sentry)
  if (!err.isOperational) {
    // sendErrorToSentry(err);  // Example of external logging (uncomment and implement as needed)
  }

  // Send a consistent error response to the client
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error', // Send the original error message
    message: userMessage, // Send the user-friendly message
  });

  // If the error is non-operational, propagate it to the next handler or logging service
  if (!err.isOperational) {
    next(err); // Propagate non-operational errors for further handling
  }
};
/**
 * Helper function to create a new instance of AppError and either pass it to the next middleware or throw it.
 * This function simplifies creating errors with appropriate status codes and user-friendly messages.
 * If `next` is available (e.g., in Express route handlers), the error is passed to the next middleware.
 * If `next` is not available (e.g., in service functions or non-Express contexts), the error is thrown directly.
 *
 * @param {NextFunction | null} next - The `next` function from Express to forward the error to the next middleware.
 * @param {string} message - The error message to be included in the error object.
 * @param {number} statusCode - The HTTP status code associated with the error.
 * @param {boolean} [isOperational=true] - Flag to indicate whether the error is operational (i.e., expected behavior, not a server crash).
 * @param {string} [userMessage] - A user-friendly message to be sent to the client (optional). This message can be customized to be more user-friendly.
 *
 * @returns {void} - This function doesn't return anything. It either forwards the error via `next()` or throws it.
 *
 * @example
 * // Inside an Express route handler (with `next` function available)
 * createAppError(next, 'Missing required fields', 400, true, 'Title, price, and duration are required.');
 *
 * // Inside a service or non-Express context (without `next` function)
 * try {
 *   createAppError(null, 'Database connection failed', 500);
 * } catch (error) {
 *   // Handle the error (e.g., log it, send a response, etc.)
 * }
 */
export const createAppError = (
  message: string,
  statusCode: number,
  isOperational: boolean = true,
  userMessage?: string,
  next?: NextFunction,
  error?: unknown,
): void => {
  const appError = new AppError(
    message,
    statusCode,
    isOperational,
    userMessage,
  );

  console.error(error);

  if (next) {
    // If `next` is available (Express context), forward the error
    next(appError);
  } else {
    // If `next` is not available (non-Express context), throw the error
    throw appError;
  }
};
