export interface SuccessResponse<T = any> {
  success: true;
  message?: string;
  data: T;
  meta?: any;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export const formatSuccess = <T>(data: T, message?: string, meta?: any): SuccessResponse<T> => {
  return {
    success: true,
    ...(message && { message }),
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };
};

export const formatError = (message: string, code = 'INTERNAL_SERVER_ERROR', details?: any): ErrorResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
};
