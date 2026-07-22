import { useState } from 'react';
import { Modal, Upload, Button, Alert, Progress, Space, Typography, Divider, Tabs, Input } from 'antd';
import { InboxOutlined, UploadOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { uploadLogs } from '../services/logService.js';

const { Dragger } = Upload;
const { Text, Title } = Typography;
const { TextArea } = Input;

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

  const processRecords = async (records) => {
    if (!Array.isArray(records)) {
      setError('Invalid format: the JSON must be an array of log records (e.g. [{...}, {...}])');
      return;
    }
    if (records.length === 0) {
      setError('The array is empty. Please provide at least one log record.');
      return;
    }
    if (records.length > 10000) {
      setError(`Too many records: ${records.length}. Maximum allowed is 10,000 per upload.`);
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
  const handleFileUpload = async (file) => {
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    if (!isJson) {
      setError('Only JSON files are supported. Please upload a .json file.');
      return false;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        await processRecords(parsed);
      } catch {
        setError('Failed to parse JSON file. Please ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    return false; // Prevent default upload behaviour
  };

  // Handle raw JSON paste
  const handlePasteUpload = async () => {
    try {
      const parsed = JSON.parse(jsonText);
      await processRecords(parsed);
    } catch {
      setError('Invalid JSON. Please check the syntax and try again.');
    }
  };

  const tabItems = [
    {
      key: 'file',
      label: 'Upload File',
      children: (
        <Dragger
          accept=".json"
          showUploadList={false}
          beforeUpload={handleFileUpload}
          disabled={uploading}
          style={{ marginBottom: 16 }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 40, color: '#2f81f7' }} />
          </p>
          <p className="ant-upload-text">Drag & drop a JSON file here</p>
          <p className="ant-upload-hint">
            Supports JSON arrays of up to 10,000 audit log records.
            Click to browse.
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
            placeholder={'[\n  {\n    "actor": "priya.nair@company.com",\n    "role": "admin",\n    ...\n  }\n]'}
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
      width={600}
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
          description={error}
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 12 }}
        />
      )}

      {result && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
            }}
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
              { label: 'Total Received', value: result.totalReceived, color: '#e6edf3' },
              { label: 'Inserted', value: result.inserted, color: '#22c55e' },
              { label: 'Duplicates', value: result.duplicates, color: '#f97316' },
              { label: 'Failed', value: result.failed, color: '#ef4444' },
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
                <Text style={{ color, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
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
