export class ApiError extends Error {
  public status?: number;
  public data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, data?: any) {
    super(message, 400, data);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ServerError extends ApiError {
  constructor(message: string, status = 500) {
    super(message, status);
    this.name = "ServerError";
  }
}

export class RateLimitError extends ApiError {
  public retryAfter?: string;

  constructor(message: string, retryAfter?: string) {
    super(message, 429);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}
