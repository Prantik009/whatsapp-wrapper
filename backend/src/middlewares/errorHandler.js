// src/middleware/errorHandler.js
export const globalErrorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle custom ApiError
  if (err.isOperational && err.statusCode) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }

  // Handle specific known Mongoose or system errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  if (err.code === 11000) {
    statusCode = 409;
    const duplicateField = Object.keys(err.keyValue)[0];
    message = `Duplicate value for '${duplicateField}': ${err.keyValue[duplicateField]}`;
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Fallback for unhandled errors
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
