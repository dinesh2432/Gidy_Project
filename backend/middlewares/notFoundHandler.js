import { createResponse } from '../utils/helpers.js';

/**
 * Handles 404 - Route Not Found errors.
 * Must be registered AFTER all valid routes.
 */
const notFoundHandler = (req, res) => {
  res
    .status(404)
    .json(createResponse(false, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFoundHandler;
