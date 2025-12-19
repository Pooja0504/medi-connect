/**
 * Structured error handling for healthcare applications
 * Returns safe, human-readable errors without leaking sensitive data
 */

export interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
  timestamp: string;
  correlationId?: string;
  details?: Record<string, any>;
}

export enum ErrorCode {
  // Auth errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }

  toResponse(correlationId?: string): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: new Date().toISOString(),
      ...(correlationId && { correlationId }),
      ...(this.details && { details: this.details }),
    };
  }
}

// Common error instances
export const errors = {
  invalidCredentials: () =>
    new AppError(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password', 401),

  tokenExpired: () =>
    new AppError(ErrorCode.TOKEN_EXPIRED, 'Your session has expired. Please login again', 401),

  unauthorized: () =>
    new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401),

  forbidden: () =>
    new AppError(ErrorCode.FORBIDDEN, 'You do not have permission to perform this action', 403),

  validationError: (field: string, message: string) =>
    new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Validation failed for field: ${field}`,
      400,
      { field, message }
    ),

  missingField: (field: string) =>
    new AppError(ErrorCode.MISSING_FIELD, `Required field missing: ${field}`, 400, { field }),

  notFound: (resource: string) =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404, { resource }),

  alreadyExists: (resource: string) =>
    new AppError(ErrorCode.ALREADY_EXISTS, `${resource} already exists`, 409, { resource }),

  conflict: (message: string) =>
    new AppError(ErrorCode.CONFLICT, message, 409),

  internalError: () =>
    new AppError(ErrorCode.INTERNAL_ERROR, 'An unexpected error occurred. Please try again later', 500),

  databaseError: () =>
    new AppError(
      ErrorCode.DATABASE_ERROR,
      'A database error occurred. Please try again later',
      500
    ),
};
