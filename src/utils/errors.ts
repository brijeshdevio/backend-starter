import { ERROR_CODES } from "../constants";

export interface ApiError<E = unknown> {
  code: string;
  details?: E;
}

export class HttpException<E = unknown> extends Error {
  public readonly status: number;
  public readonly success: boolean = false;
  public readonly error: ApiError<E>;

  constructor(message: string, status: number, code: string, details?: E) {
    super(message);

    this.status = status;
    this.error = {
      code,
      details,
    };

    Error.captureStackTrace(this, this.constructor);
  }

  toResponse() {
    return {
      success: this.success,
      status: this.status,
      message: this.message,
      error: this.error,
    };
  }
}

export class BadRequestException<E = unknown> extends HttpException<E> {
  constructor(
    message = "Bad Request",
    details?: E,
    code = ERROR_CODES.VALIDATION_ERROR,
  ) {
    super(message, 400, code, details);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(message, 401, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(message, 403, ERROR_CODES.FORBIDDEN);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Resource Not Found") {
    super(message, 404, ERROR_CODES.NOT_FOUND);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict") {
    super(message, 409, ERROR_CODES.CONFLICT);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message = "Internal Server Error") {
    super(message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR);
  }
}
