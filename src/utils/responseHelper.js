/**
 * Response Helper Utilities
 * Standardized API response functions
 */

/**
 * Success response
 */
const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Error response
 */
const errorResponse = (res, message, statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 */
const paginateResults = (page, limit, total) => {
  return {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginateResults,
};
