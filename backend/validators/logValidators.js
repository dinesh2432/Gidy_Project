import { query, body } from 'express-validator';
import {
  ROLES,
  ACTIONS,
  RESOURCE_TYPES,
  SEVERITY_LEVELS,
  STATUS_TYPES,
  REGIONS,
  SORT_FIELDS,
  SORT_ORDERS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_BULK_UPLOAD,
} from '../constants/logConstants.js';

/**
 * Validates query parameters for GET /api/logs
 */
export const getLogsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: MAX_PAGE_SIZE })
    .withMessage(`Limit must be between 1 and ${MAX_PAGE_SIZE}`)
    .toInt(),

  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search query must not exceed 200 characters'),

  query('role')
    .optional()
    .isIn(ROLES)
    .withMessage(`Role must be one of: ${ROLES.join(', ')}`),

  query('action')
    .optional()
    .isIn(ACTIONS)
    .withMessage('Invalid action filter value'),

  query('resourceType')
    .optional()
    .isIn(RESOURCE_TYPES)
    .withMessage(`ResourceType must be one of: ${RESOURCE_TYPES.join(', ')}`),

  query('severity')
    .optional()
    .isIn(SEVERITY_LEVELS)
    .withMessage(`Severity must be one of: ${SEVERITY_LEVELS.join(', ')}`),

  query('status')
    .optional()
    .isIn(STATUS_TYPES)
    .withMessage(`Status must be one of: ${STATUS_TYPES.join(', ')}`),

  query('region')
    .optional()
    .isIn(REGIONS)
    .withMessage(`Region must be one of: ${REGIONS.join(', ')}`),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('startDate must be a valid ISO 8601 date')
    .toDate(),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('endDate must be a valid ISO 8601 date')
    .toDate(),

  query('sortBy')
    .optional()
    .isIn(SORT_FIELDS)
    .withMessage(`sortBy must be one of: ${SORT_FIELDS.join(', ')}`),

  query('sortOrder')
    .optional()
    .isIn(SORT_ORDERS)
    .withMessage(`sortOrder must be "asc" or "desc"`),
];

/**
 * Validates a single log record object.
 * Used server-side for bulk record validation (not express-validator).
 * Returns an array of error strings, empty if valid.
 */
export const validateSingleLog = (log, index) => {
  const errors = [];
  const prefix = `Record[${index}]`;

  // Required string fields
  if (!log.actor || typeof log.actor !== 'string') {
    errors.push(`${prefix}: actor is required`);
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(log.actor)) {
    errors.push(`${prefix}: actor must be a valid email address`);
  }

  if (!log.role) {
    errors.push(`${prefix}: role is required`);
  } else if (!ROLES.includes(log.role)) {
    errors.push(`${prefix}: role "${log.role}" is not valid. Must be one of: ${ROLES.join(', ')}`);
  }

  if (!log.action) {
    errors.push(`${prefix}: action is required`);
  } else if (!ACTIONS.includes(log.action)) {
    errors.push(`${prefix}: action "${log.action}" is not a recognized action`);
  }

  if (!log.resource || typeof log.resource !== 'string') {
    errors.push(`${prefix}: resource is required`);
  }

  if (!log.resourceType) {
    errors.push(`${prefix}: resourceType is required`);
  } else if (!RESOURCE_TYPES.includes(log.resourceType)) {
    errors.push(`${prefix}: resourceType "${log.resourceType}" is not valid`);
  }

  // IP address validation (IPv4 + IPv6)
  if (!log.ipAddress) {
    errors.push(`${prefix}: ipAddress is required`);
  } else {
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (!ipv4.test(log.ipAddress) && !ipv6.test(log.ipAddress)) {
      errors.push(`${prefix}: ipAddress "${log.ipAddress}" is not a valid IPv4 or IPv6 address`);
    }
  }

  if (!log.region) {
    errors.push(`${prefix}: region is required`);
  } else if (!REGIONS.includes(log.region)) {
    errors.push(`${prefix}: region "${log.region}" is not valid`);
  }

  if (!log.severity) {
    errors.push(`${prefix}: severity is required`);
  } else if (!SEVERITY_LEVELS.includes(log.severity)) {
    errors.push(`${prefix}: severity must be one of: ${SEVERITY_LEVELS.join(', ')}`);
  }

  if (!log.status) {
    errors.push(`${prefix}: status is required`);
  } else if (!STATUS_TYPES.includes(log.status)) {
    errors.push(`${prefix}: status must be "Resolved" or "Unresolved"`);
  }

  // Timestamp validation
  if (!log.timestamp) {
    errors.push(`${prefix}: timestamp is required`);
  } else {
    const ts = new Date(log.timestamp);
    if (isNaN(ts.getTime())) {
      errors.push(`${prefix}: timestamp "${log.timestamp}" is not a valid ISO 8601 date`);
    }
  }

  return errors;
};

/**
 * Validates the upload body — must be a non-empty array.
 * The individual record validation is done inside the service.
 */
export const uploadLogsValidator = [
  body()
    .isArray({ min: 1, max: MAX_BULK_UPLOAD })
    .withMessage(
      `Request body must be a JSON array of 1–${MAX_BULK_UPLOAD} log records`
    ),
];
