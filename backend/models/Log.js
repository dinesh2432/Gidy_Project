import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

import {
  ROLES,
  ACTIONS,
  RESOURCE_TYPES,
  SEVERITY_LEVELS,
  STATUS_TYPES,
  REGIONS,
} from '../constants/logConstants.js';

const logSchema = new mongoose.Schema(
  {
    actor: {
      type: String,
      required: [true, 'Actor (email) is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Actor must be a valid email address',
      ],
    },

    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ROLES,
        message: `Role must be one of: ${ROLES.join(', ')}`,
      },
    },

    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: {
        values: ACTIONS,
        message: `Action must be one of the allowed action types`,
      },
    },

    resource: {
      type: String,
      required: [true, 'Resource is required'],
      trim: true,
    },

    resourceType: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: RESOURCE_TYPES,
        message: `ResourceType must be one of: ${RESOURCE_TYPES.join(', ')}`,
      },
    },

    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      trim: true,
      validate: {
        validator: (ip) => {
          const ipv4 =
            /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
          const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          return ipv4.test(ip) || ipv6.test(ip);
        },
        message: (props) => `"${props.value}" is not a valid IPv4 or IPv6 address`,
      },
    },

    region: {
      type: String,
      required: [true, 'Region is required'],
      enum: {
        values: REGIONS,
        message: `Region must be one of: ${REGIONS.join(', ')}`,
      },
    },

    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: {
        values: SEVERITY_LEVELS,
        message: `Severity must be one of: ${SEVERITY_LEVELS.join(', ')}`,
      },
    },

    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: STATUS_TYPES,
        message: `Status must be either "Resolved" or "Unresolved"`,
      },
      default: 'Unresolved',
    },

    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      validate: {
        validator: (val) => val instanceof Date && !isNaN(val.getTime()),
        message: 'Timestamp must be a valid ISO 8601 date',
      },
    },

    // Used to detect and prevent duplicate bulk uploads
    uploadBatch: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    versionKey: false,
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Single-field indexes for common filter operations
logSchema.index({ actor: 1 });
logSchema.index({ timestamp: -1 });
logSchema.index({ severity: 1 });
logSchema.index({ status: 1 });
logSchema.index({ role: 1 });
logSchema.index({ action: 1 });
logSchema.index({ resourceType: 1 });
logSchema.index({ region: 1 });
logSchema.index({ ipAddress: 1 });

// Compound indexes for stats queries (severity + timestamp is very common)
logSchema.index({ severity: 1, timestamp: -1 });
logSchema.index({ status: 1, timestamp: -1 });

// Full-text search index across all searchable string fields
logSchema.index(
  {
    actor: 'text',
    action: 'text',
    resource: 'text',
    resourceType: 'text',
    role: 'text',
    region: 'text',
    status: 'text',
    ipAddress: 'text',
  },
  {
    name: 'log_text_search',
    weights: {
      actor: 10,
      action: 8,
      resource: 6,
      resourceType: 5,
      role: 4,
      status: 3,
      region: 2,
      ipAddress: 2,
    },
  }
);

// ─── Plugins ──────────────────────────────────────────────────────────────────
logSchema.plugin(mongoosePaginate);
logSchema.plugin(mongooseAggregatePaginate);

const Log = mongoose.model('Log', logSchema);

export default Log;
