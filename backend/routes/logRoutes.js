import { Router } from 'express';
import { uploadLogs, getLogs, getLogStats, getLogById } from '../controllers/logController.js';
import { getLogsValidator, uploadLogsValidator } from '../validators/logValidators.js';
import validate from '../middlewares/validate.js';

const router = Router();

/**
 * @route   POST /api/logs/upload
 * @desc    Bulk upload up to 10,000 audit log records
 * @access  Public
 * @body    JSON array of log objects
 */
router.post('/upload', uploadLogsValidator, validate, uploadLogs);

/**
 * @route   GET /api/logs/stats
 * @desc    Get aggregated dashboard statistics
 * @access  Public
 * NOTE: This route MUST be defined BEFORE /api/logs/:id
 *       to prevent Express from treating "stats" as a dynamic :id param
 */
router.get('/stats', getLogStats);

/**
 * @route   GET /api/logs
 * @desc    Get paginated, filtered, sorted logs
 * @access  Public
 * @query   page, limit, search, role, action, resourceType,
 *          severity, status, region, startDate, endDate, sortBy, sortOrder
 */
router.get('/', getLogsValidator, validate, getLogs);

/**
 * @route   GET /api/logs/:id
 * @desc    Get a single log record by MongoDB ObjectId
 * @access  Public
 */
router.get('/:id', getLogById);

export default router;
