export const ROLES = ['admin', 'developer', 'analyst', 'viewer', 'auditor', 'operator'];

export const ACTIONS = [
  'DELETE_USER',
  'CREATE_USER',
  'UPDATE_USER',
  'LOGIN',
  'LOGOUT',
  'FAILED_LOGIN',
  'PASSWORD_RESET',
  'PERMISSION_CHANGE',
  'DATA_EXPORT',
  'DATA_IMPORT',
  'CONFIG_CHANGE',
  'ACCESS_DENIED',
  'FILE_DELETE',
  'FILE_CREATE',
  'FILE_UPDATE',
  'API_KEY_CREATED',
  'API_KEY_REVOKED',
  'ROLE_ASSIGNED',
  'ROLE_REMOVED',
  'SESSION_EXPIRED',
  'MFA_ENABLED',
  'MFA_DISABLED',
  'ACCOUNT_LOCKED',
  'ACCOUNT_UNLOCKED',
  'DATABASE_BACKUP',
  'DATABASE_RESTORE',
  'SYSTEM_RESTART',
  'POLICY_CREATED',
  'POLICY_DELETED',
  'AUDIT_EXPORT',
];

export const RESOURCE_TYPES = [
  'USER',
  'ROLE',
  'FILE',
  'DATABASE',
  'API',
  'SYSTEM',
  'POLICY',
  'SESSION',
  'CONFIGURATION',
  'AUDIT',
  'REPORT',
  'KEY',
];

export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

export const STATUS_TYPES = ['Resolved', 'Unresolved'];

export const REGIONS = [
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'sa-east-1',
  'ca-central-1',
  'af-south-1',
  'me-south-1',
];

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;
export const MAX_BULK_UPLOAD = 10000;

export const SORT_FIELDS = ['timestamp', 'severity', 'actor', 'action', 'region'];
export const SORT_ORDERS = ['asc', 'desc'];

export const SEVERITY_ORDER = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
