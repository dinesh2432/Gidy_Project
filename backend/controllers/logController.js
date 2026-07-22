import { bulkUploadLogs, fetchLogs, fetchLogById, fetchLogStats } from '../services/logService.js';
import { createResponse, asyncHandler } from '../utils/helpers.js';

/**
 * POST /api/logs/upload
 * Accepts a JSON array of up to 10,000 log records.
 * Validates every record, inserts valid ones, and returns upload statistics.
 */
export const uploadLogs = asyncHandler(async (req, res) => {
  const records = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json(
      createResponse(false, 'Request body must be a non-empty JSON array of log records')
    );
  }

  const stats = await bulkUploadLogs(records);

  // If every single record failed validation, treat as a 422
  if (stats.inserted === 0 && stats.duplicates === 0 && stats.failed === stats.totalReceived) {
    return res.status(422).json(
      createResponse(false, 'All records failed validation. No logs were inserted.', stats)
    );
  }

  const message =
    stats.inserted > 0
      ? `Upload complete. ${stats.inserted} logs inserted successfully.`
      : `Upload processed. No new logs were inserted.`;

  return res.status(201).json(createResponse(true, message, stats));
});

/**
 * GET /api/logs
 * Returns paginated, filtered, sorted logs based on query parameters.
 * All processing is done on the backend.
 */
export const getLogs = asyncHandler(async (req, res) => {
  const { logs, pagination } = await fetchLogs(req.query);

  return res.status(200).json(
    createResponse(true, 'Logs retrieved successfully', logs, { pagination })
  );
});

/**
 * GET /api/logs/stats
 * Returns aggregated dashboard statistics.
 */
export const getLogStats = asyncHandler(async (req, res) => {
  const stats = await fetchLogStats();

  return res.status(200).json(
    createResponse(true, 'Statistics retrieved successfully', stats)
  );
});

/**
 * GET /api/logs/:id
 * Returns a single log record by its MongoDB ObjectId.
 */
export const getLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Quick format check before hitting the database
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json(
      createResponse(false, 'Invalid log ID format. Must be a 24-character hex string.')
    );
  }

  const log = await fetchLogById(id);

  if (!log) {
    return res.status(404).json(
      createResponse(false, `Log with ID "${id}" was not found`)
    );
  }

  return res.status(200).json(createResponse(true, 'Log retrieved successfully', log));
});
