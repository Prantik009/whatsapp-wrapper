// src/middleware/ApiError.js
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // for controlled app errors
    Error.captureStackTrace(this, this.constructor);
  }
}
