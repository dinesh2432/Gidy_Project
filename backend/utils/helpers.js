/**
 * Generates a standardized API response object.
 * @param {boolean} success - Whether the operation succeeded.
 * @param {string} message - Human-readable response message.
 * @param {object|null} data - Response payload.
 * @param {object|null} meta - Optional pagination or extra metadata.
 */
export const createResponse = (success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
};

/**
 * Wraps an async route handler to catch errors and pass them to next().
 * Eliminates try/catch boilerplate in every controller.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Parses a "processingTime" string from a start Date.
 */
export const getProcessingTime = (startTime) => {
  const ms = Date.now() - startTime;
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Builds a MongoDB filter object from validated query parameters.
 */
export const buildLogFilter = (query) => {
  const {
    search,
    role,
    action,
    resourceType,
    severity,
    status,
    region,
    startDate,
    endDate,
  } = query;

  const filter = {};

  // Full-text search across indexed fields
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() };
  }

  // Enum-based filters
  if (role) filter.role = role;
  if (action) filter.action = action;
  if (resourceType) filter.resourceType = resourceType;
  if (severity) filter.severity = severity;
  if (status) filter.status = status;
  if (region) filter.region = region;

  // Date range filter on timestamp
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  return filter;
};

/**
 * Builds a MongoDB sort object from query parameters.
 * @param {string} sortBy - Field to sort by.
 * @param {string} sortOrder - 'asc' or 'desc'.
 */
export const buildSortObject = (sortBy = 'timestamp', sortOrder = 'desc') => {
  const order = sortOrder === 'asc' ? 1 : -1;
  return { [sortBy]: order };
};

/**
 * Validates an IP address (IPv4 or IPv6).
 */
export const isValidIpAddress = (ip) => {
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * Validates an ISO 8601 timestamp string.
 */
export const isValidTimestamp = (ts) => {
  const date = new Date(ts);
  return !isNaN(date.getTime()) && ts.includes('T');
};

/**
 * Validates an email address.
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
