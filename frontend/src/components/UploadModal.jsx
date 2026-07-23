import { useState } from 'react';
import {
  Modal, Upload, Button, Alert, Progress, Space, Typography,
  Divider, Tabs, Input,
} from 'antd';
import {
  InboxOutlined, UploadOutlined, CheckCircleOutlined, WarningOutlined,
} from '@ant-design/icons';
import { uploadLogs } from '../services/logService.js';

const { Dragger } = Upload;
const { Text, Title } = Typography;
const { TextArea } = Input;

/**
 * Normalizes parsed JSON into a flat log array.
 *
 * Handles three possible shapes:
 *   1. Plain array:                    [{...}, {...}]        ← ideal
 *   2. API response wrapper:           { data: [{...}] }     ← exported from network tab
 *   3. Success response wrapper:       { success, data: [] } ← copied from API response
 *
 * Strips MongoDB internal fields (_id, __v, uploadBatch, createdAt, updatedAt)
 * so re-uploading exported files never causes duplicate key errors.
 */
const normalizeRecords = (parsed) => {
  let records = parsed;

  // Handle wrapped API response: { data: [...] } or { success: true, data: [...] }
  if (!Array.isArray(parsed) && parsed !== null && typeof parsed === 'object') {
    if (Array.isArray(parsed.data)) {
      records = parsed.data;
    } else if (Array.isArray(parsed.logs)) {
      records = parsed.logs;
    }
  }

  if (!Array.isArray(records)) {
    return null; // Cannot extract an array — caller must show error
  }

  // Strip internal MongoDB fields that would cause re-upload duplicate key errors
  return records.map(({ _id, __v, uploadBatch, createdAt, updatedAt, ...rest }) => rest);
};

/**
 * Upload modal supporting JSON file drag-and-drop and raw JSON paste.
 *
 * @param {boolean} open - Modal visibility
 * @param {function} onClose - Close callback
 * @param {function} onSuccess - Called after successful upload (triggers data refresh)
 */
const UploadModal = ({ open, onClose, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [activeTab, setActiveTab] = useState('file');

  const resetState = () => {
    setResult(null);
    setError(null);
    setJsonText('');
    setActiveTab('file');
  };

  const handleClose = () => {
    if (!uploading) {
      resetState();
      onClose();
    }
  };

  const processRecords = async (rawParsed) => {
    const records = normalizeRecords(rawParsed);

    if (records === null) {
      setError(
        'Invalid format: the JSON must be an array of log records.\n' +
        'Expected: [{...}, {...}] or {"data": [{...}, {...}]}\n' +
        'Received: ' + (typeof rawParsed)
      );
      return;
    }

    if (records.length === 0) {
      setError('The array is empty. Please provide at least one log record.');
      return;
    }

    if (records.length > 10000) {
      setError(
        `Too many records: ${records.length.toLocaleString()}. Maximum allowed is 10,000 per upload.`
      );
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadLogs(records);
      setResult(response.data);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file upload via Dragger
  // Note: AntD v5 beforeUpload receives an UploadFile wrapper.
  // Use originFileObj to get the native File for FileReader.
  const handleFileUpload = (file) => {
    const nativeFile = file.originFileObj || file;
    const fileName = nativeFile.name || file.name || '';
    const fileType = nativeFile.type || file.type || '';

    const isJson = fileType === 'application/json' || fileName.endsWith('.json');
    if (!isJson) {
      setError('Only .json files are supported. Please select a valid JSON file.');
      return false;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        if (!text || text.trim() === '') {
          setError('The file appears to be empty. Please check and try again.');
          return;
        }
        const parsed = JSON.parse(text);
        processRecords(parsed);
      } catch (parseErr) {
        setError(
          'Failed to parse JSON file. Please ensure the file contains valid JSON.\n' +
          `Parser error: ${parseErr.message}`
        );
      }
    };

    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
    };

    reader.readAsText(nativeFile);
    return false; // Prevent AntD's default upload behaviour
  };

  // Handle raw JSON paste
  const handlePasteUpload = () => {
    try {
      const parsed = JSON.parse(jsonText);
      processRecords(parsed);
    } catch (parseErr) {
      setError(
        'Invalid JSON syntax. Please check the content and try again.\n' +
        `Parser error: ${parseErr.message}`
      );
    }
  };

  const tabItems = [
    {
      key: 'file',
      label: 'Upload File',
      children: (
        <Dragger
          accept=".json,application/json"
          showUploadList={false}
          beforeUpload={handleFileUpload}
          disabled={uploading}
          style={{ marginBottom: 16 }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 40, color: '#2f81f7' }} />
          </p>
          <p className="ant-upload-text">Drag &amp; drop a JSON file here, or click to browse</p>
          <p className="ant-upload-hint">
            Accepts: plain arrays <code>[{'{...}'}]</code> or API response wrappers{' '}
            <code>{'{data: [{...}]}'}</code>. Max 10,000 records. Internal fields (
            <code>_id</code>, <code>uploadBatch</code>) are automatically stripped.
          </p>
        </Dragger>
      ),
    },
    {
      key: 'paste',
      label: 'Paste JSON',
      children: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <TextArea
            id="json-paste-input"
            placeholder={
              '[\n  {\n    "actor": "priya.nair@company.com",\n' +
              '    "role": "admin",\n    "action": "DELETE_USER",\n' +
              '    "resource": "/api/users/334",\n    "resourceType": "USER",\n' +
              '    "ipAddress": "192.168.1.45",\n    "region": "ap-south-1",\n' +
              '    "severity": "HIGH",\n    "status": "Unresolved",\n' +
              '    "timestamp": "2025-06-14T08:32:11Z"\n  }\n]'
            }
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              background: '#0d1117',
              color: '#e6edf3',
              borderColor: '#30363d',
            }}
            disabled={uploading}
          />
          <Button
            id="paste-upload-btn"
            type="primary"
            icon={<UploadOutlined />}
            onClick={handlePasteUpload}
            loading={uploading}
            disabled={!jsonText.trim()}
            block
          >
            Upload JSON
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <UploadOutlined style={{ color: '#2f81f7' }} />
          <span>Bulk Upload Audit Logs</span>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={typeof window !== 'undefined' && window.innerWidth <= 640
        ? window.innerWidth - 16
        : 620}
      destroyOnHidden
      mask={{ closable: !uploading }}
    >
      {uploading && (
        <div style={{ marginBottom: 16 }}>
          <Progress percent={99} status="active" strokeColor="#2f81f7" />
          <Text style={{ color: '#8b949e', fontSize: 12 }}>
            Processing records… This may take a moment for large batches.
          </Text>
        </div>
      )}

      {!result && !uploading && (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: 8 }}
        />
      )}

      {error && (
        <Alert
          type="error"
          icon={<WarningOutlined />}
          title="Upload Error"
          description={
            <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>
              {error}
            </pre>
          }
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 12 }}
        />
      )}

      {result && (
        <div>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}
          >
            <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 22 }} />
            <Title level={5} style={{ margin: 0, color: '#e6edf3' }}>
              Upload Complete
            </Title>
          </div>

          <div
            style={{
              background: '#0d1117',
              borderRadius: 8,
              padding: 16,
              border: '1px solid #30363d',
            }}
          >
            {[
              { label: 'Total Received', value: (result.totalReceived || 0).toLocaleString(), color: '#e6edf3' },
              { label: 'Inserted', value: (result.inserted || 0).toLocaleString(), color: '#22c55e' },
              { label: 'Duplicates Skipped', value: (result.duplicates || 0).toLocaleString(), color: '#f97316' },
              { label: 'Failed Validation', value: (result.failed || 0).toLocaleString(), color: result.failed > 0 ? '#ef4444' : '#6e7681' },
              { label: 'Processing Time', value: result.processingTime, color: '#2f81f7' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: '1px solid #21262d',
                }}
              >
                <Text style={{ color: '#8b949e', fontSize: 13 }}>{label}</Text>
                <Text
                  style={{ color, fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13 }}
                >
                  {value}
                </Text>
              </div>
            ))}
          </div>

          {result.validationErrors?.length > 0 && (
            <>
              <Divider style={{ borderColor: '#30363d', margin: '12px 0' }} />
              <Alert
                type="warning"
                title={`${result.validationErrors.length} validation issue(s) found`}
                description={
                  <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 12 }}>
                    {result.validationErrors.slice(0, 10).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {result.validationErrors.length > 10 && (
                      <li>…and {result.validationErrors.length - 10} more</li>
                    )}
                  </ul>
                }
                showIcon
              />
            </>
          )}

          <Divider style={{ borderColor: '#30363d', margin: '16px 0' }} />
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button id="upload-again-btn" onClick={resetState}>
              Upload Again
            </Button>
            <Button id="upload-done-btn" type="primary" onClick={handleClose}>
              Done
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default UploadModal;
