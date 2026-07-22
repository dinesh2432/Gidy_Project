import { v4 as uuidv4 } from 'uuid';
import Log from '../models/Log.js';
import { validateSingleLog } from '../validators/logValidators.js';
import { buildLogFilter, buildSortObject, getProcessingTime } from '../utils/helpers.js';
import { DEFAULT_PAGE_SIZE } from '../constants/logConstants.js';

/**
 * Bulk upload service.
 * Validates every record, separates valid from invalid,
 * and uses insertMany with ordered:false to handle duplicates gracefully.
 *
 * @param {Array} records - Raw array of log objects from request body
 * @returns {object} Upload statistics
 */
export const bulkUploadLogs = async (records) => {
  const startTime = Date.now();
  const batchId = uuidv4();

  const validRecords = [];
  const validationErrors = [];

  // Validate every record individually
  for (let i = 0; i < records.length; i++) {
    const errors = validateSingleLog(records[i], i);
    if (errors.length > 0) {
      validationErrors.push(...errors);
    } else {
      validRecords.push({
        ...records[i],
        actor: records[i].actor.toLowerCase().trim(),
        timestamp: new Date(records[i].timestamp),
        uploadBatch: batchId,
      });
    }
  }

  let insertedCount = 0;
  let duplicateCount = 0;
  const insertErrors = [];

  if (validRecords.length > 0) {
    try {
      // ordered:false — continue inserting even when some docs fail (e.g. duplicates)
      const result = await Log.insertMany(validRecords, {
        ordered: false,
        rawResult: true,
      });
      insertedCount = result.insertedCount;
    } catch (err) {
      // BulkWriteError — some inserted, some failed
      if (err.code === 11000 || err.name === 'MongoBulkWriteError') {
        insertedCount = err.result?.nInserted ?? 0;
        duplicateCount = err.result?.getWriteErrors?.()?.filter(
          (e) => e.code === 11000
        ).length ?? 0;
        const otherErrors = err.result?.getWriteErrors?.()?.filter(
          (e) => e.code !== 11000
        ) ?? [];
        otherErrors.forEach((e) =>
          insertErrors.push(`Insert error at index ${e.index}: ${e.errmsg}`)
        );
      } else {
        throw err;
      }
    }
  }

  const totalFailed = records.length - validRecords.length - duplicateCount + insertErrors.length;

  return {
    totalReceived: records.length,
    inserted: insertedCount,
    duplicates: duplicateCount,
    failed: Math.max(0, totalFailed),
    validationErrors: validationErrors.slice(0, 50), // Cap error list for response size
    processingTime: getProcessingTime(startTime),
  };
};

/**
 * Fetch paginated, filtered, and sorted logs with server-side processing.
 *
 * @param {object} queryParams - Validated query parameters
 * @returns {object} Paginated result from mongoose-paginate-v2
 */
export const fetchLogs = async (queryParams) => {
  const {
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
    sortBy = 'timestamp',
    sortOrder = 'desc',
  } = queryParams;

  const filter = buildLogFilter(queryParams);
  const sort = buildSortObject(sortBy, sortOrder);

  const paginateOptions = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    lean: true, // Return plain JS objects (faster, less memory)
    leanWithId: false,
    select: '-uploadBatch -createdAt -updatedAt', // Exclude internal fields by default
  };

  const result = await Log.paginate(filter, paginateOptions);

  return {
    logs: result.docs,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
      limit: result.limit,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
    },
  };
};

/**
 * Fetch a single log record by its MongoDB ObjectId.
 *
 * @param {string} logId - MongoDB ObjectId string
 * @returns {object|null} Log document or null
 */
export const fetchLogById = async (logId) => {
  const log = await Log.findById(logId).lean();
  return log;
};

/**
 * Fetch dashboard statistics.
 * Uses lean aggregation for performance — avoids full collection scan.
 *
 * @returns {object} Statistics object
 */
export const fetchLogStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [severityStats, statusStats, todayCount, total] = await Promise.all([
    // Count by severity
    Log.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]),

    // Count by status
    Log.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Today's uploads
    Log.countDocuments({ timestamp: { $gte: today } }),

    // Total log count
    Log.estimatedDocumentCount(),
  ]);

  // Map severity array to flat object
  const severityMap = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  severityStats.forEach(({ _id, count }) => {
    if (_id in severityMap) severityMap[_id] = count;
  });

  // Map status array to flat object
  const statusMap = { Resolved: 0, Unresolved: 0 };
  statusStats.forEach(({ _id, count }) => {
    if (_id in statusMap) statusMap[_id] = count;
  });

  return {
    total,
    critical: severityMap.CRITICAL,
    high: severityMap.HIGH,
    medium: severityMap.MEDIUM,
    low: severityMap.LOW,
    resolved: statusMap.Resolved,
    unresolved: statusMap.Unresolved,
    todayUploads: todayCount,
  };
};
