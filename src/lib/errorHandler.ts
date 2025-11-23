// Global error handling utilities

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  timestamp: Date;
}

export class SmartMartError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: unknown) {
    super(message);
    this.name = 'SmartMartError';
    this.code = code;
    this.details = details;
  }
}

// Error codes for different types of errors
export const ERROR_CODES = {
  // Cart errors
  CART_ITEM_NOT_FOUND: 'CART_ITEM_NOT_FOUND',
  CART_INVALID_QUANTITY: 'CART_INVALID_QUANTITY',
  CART_STORAGE_ERROR: 'CART_STORAGE_ERROR',

  // Product errors
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  PRODUCT_INVALID_ID: 'PRODUCT_INVALID_ID',

  // Algorithm errors
  ALGORITHM_EXECUTION_FAILED: 'ALGORITHM_EXECUTION_FAILED',
  ALGORITHM_INVALID_PARAMETERS: 'ALGORITHM_INVALID_PARAMETERS',

  // Network/API errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',

  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Global error handler
export const handleError = (error: unknown, context?: string): AppError => {
  console.error(`Error in ${context || 'unknown context'}:`, error);

  let appError: AppError;

  if (error instanceof SmartMartError) {
    appError = {
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date(),
    };
  } else if (error instanceof Error) {
    appError = {
      message: error.message,
      code: ERROR_CODES.UNKNOWN_ERROR,
      details: { stack: error.stack },
      timestamp: new Date(),
    };
  } else {
    appError = {
      message: 'An unexpected error occurred',
      code: ERROR_CODES.UNKNOWN_ERROR,
      details: error,
      timestamp: new Date(),
    };
  }

  // In a real app, you might want to send this to an error reporting service
  // reportError(appError);

  return appError;
};

// Safe async operation wrapper
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ data: T | null; error: AppError | null }> => {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, context);
    return { data: null, error: appError };
  }
};

// Safe synchronous operation wrapper
export const safeSync = <T>(
  operation: () => T,
  context?: string
): { data: T | null; error: AppError | null } => {
  try {
    const data = operation();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, context);
    return { data: null, error: appError };
  }
};

// Utility to create user-friendly error messages
export const getErrorMessage = (error: AppError): string => {
  switch (error.code) {
    case ERROR_CODES.CART_ITEM_NOT_FOUND:
      return 'The item you\'re trying to modify is not in your cart.';
    case ERROR_CODES.CART_INVALID_QUANTITY:
      return 'Please enter a valid quantity.';
    case ERROR_CODES.PRODUCT_NOT_FOUND:
      return 'The product you\'re looking for doesn\'t exist.';
    case ERROR_CODES.ALGORITHM_EXECUTION_FAILED:
      return 'Failed to generate recommendations. Please try again.';
    case ERROR_CODES.NETWORK_ERROR:
      return 'Network connection error. Please check your internet connection.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
};

// Hook for error handling in React components
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string) => {
    const appError = handleError(error, context);
    // You could integrate with toast notifications here
    console.error('Handled error:', appError);
    return appError;
  };

  return { handleError, getErrorMessage };
};