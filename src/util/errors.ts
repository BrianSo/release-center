export class UnauthorizedError extends Error {
  constructor(...args) {
    super(...args);
    this.status = 401;
    Error.captureStackTrace(this, UnauthorizedError);
  }
}

export class NotFoundError extends Error {
  constructor(...args) {
    super(...args);
    this.status = 404;
    Error.captureStackTrace(this, NotFoundError);
  }
}

export class BadRequestError extends Error {
  constructor(...args) {
    super(...args);
    this.status = 400;
    Error.captureStackTrace(this, BadRequestError);
  }
}

export class ConflictError extends Error {
  constructor(...args) {
    super(...args);
    this.status = 409;
    Error.captureStackTrace(this, ConflictError);
  }
}
