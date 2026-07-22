import { validationResult } from 'express-validator';
import { createResponse } from '../utils/helpers.js';

/**
 * Middleware that checks express-validator results.
 * Short-circuits the request with a 422 if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
      value: e.value,
    }));
    return res.status(422).json(
      createResponse(false, 'Validation failed', { errors: formattedErrors })
    );
  }
  next();
};

export default validate;
