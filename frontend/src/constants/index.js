export const SEVERITY_COLORS = {
  CRITICAL: { color: '#b91c1c', bg: '#fef2f2', border: '#fca5a5' },
  HIGH: { color: '#dc2626', bg: '#fff1f2', border: '#fca5a5' },
  MEDIUM: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  LOW: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
};

export const STATUS_COLORS = {
  Resolved: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  Unresolved: { color: '#dc2626', bg: '#fff1f2', border: '#fca5a5' },
};

export const ROLES = ['admin', 'developer', 'analyst', 'viewer', 'auditor', 'operator'];

export const ACTIONS = [
  'DELETE_USER', 'CREATE_USER', 'UPDATE_USER', 'LOGIN', 'LOGOUT',
  'FAILED_LOGIN', 'PASSWORD_RESET', 'PERMISSION_CHANGE', 'DATA_EXPORT',
  'DATA_IMPORT', 'CONFIG_CHANGE', 'ACCESS_DENIED', 'FILE_DELETE',
  'FILE_CREATE', 'FILE_UPDATE', 'API_KEY_CREATED', 'API_KEY_REVOKED',
  'ROLE_ASSIGNED', 'ROLE_REMOVED', 'SESSION_EXPIRED', 'MFA_ENABLED',
  'MFA_DISABLED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'DATABASE_BACKUP',
  'DATABASE_RESTORE', 'SYSTEM_RESTART', 'POLICY_CREATED', 'POLICY_DELETED', 'AUDIT_EXPORT',
];

export const RESOURCE_TYPES = [
  'USER', 'ROLE', 'FILE', 'DATABASE', 'API', 'SYSTEM', 'POLICY',
  'SESSION', 'CONFIGURATION', 'AUDIT', 'REPORT', 'KEY',
];

export const SEVERITY_LEVELS = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
export const STATUS_TYPES = ['Resolved', 'Unresolved'];

export const REGIONS = [
  'us-east-1', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-central-1',
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
  'sa-east-1', 'ca-central-1', 'af-south-1', 'me-south-1',
];

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'];

export const SORT_FIELDS = [
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Severity', value: 'severity' },
  { label: 'Actor', value: 'actor' },
  { label: 'Action', value: 'action' },
  { label: 'Region', value: 'region' },
];
