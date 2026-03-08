import React, { useState, useRef } from 'react';
import { useApi } from '../useApi.js';

const ACCEPTED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
const ACCEPTED_ACCEPT = '.pdf,.jpg,.jpeg,.png,.docx';
const MAX_MB = 10;

function isAllowedFile(file) {
    const name = (file.name || '').toLowerCase();
    return ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext));
}

export default function DocumentUpload({ clientId, onUploadSuccess }) {
    const { uploadWithAuth } = useApi();
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | success | error
    const [errorMsg, setErrorMsg] = useState('');
    const [resultUrl, setResultUrl] = useState('');
    const inputRef = useRef(null);

    function handleFileChange(e) {
        const selected = e.target.files[0];
        if (!selected) return;
        if (!isAllowedFile(selected)) {
            setStatus('error');
            setErrorMsg('Only PDF, JPG, JPEG, PNG, and DOCX files are allowed.');
            setFile(null);
            return;
        }
        if (selected.size > MAX_MB * 1024 * 1024) {
            setStatus('error');
            setErrorMsg(`File is too large. Maximum size is ${MAX_MB} MB.`);
            setFile(null);
            return;
        }
        setFile(selected);
        setStatus('idle');
        setErrorMsg('');
        setResultUrl('');
    }

    async function handleUpload() {
        if (!file) return;
        setStatus('uploading');
        setErrorMsg('');
        setResultUrl('');
        try {
            const form = new FormData();
            form.append('file', file);
            if (clientId) form.append('clientId', clientId);
            const data = await uploadWithAuth('/documents/upload', form);
            setResultUrl(data.url || '');
            setStatus('success');
            setFile(null);
            if (inputRef.current) inputRef.current.value = '';
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.message || 'Upload failed. Please try again.');
        }
    }

    return (
        <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            background: 'white',
            maxWidth: '480px',
        }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                Upload Document
            </h3>

            {/* Drop zone / file picker */}
            <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: '2px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '1.5rem',
                cursor: 'pointer',
                background: file ? '#f0fdf4' : '#f8fafc',
                borderColor: file ? '#86efac' : '#cbd5e1',
                transition: 'all 0.2s',
            }}>
                <span style={{ fontSize: '2rem' }}>{file ? '📄' : '📁'}</span>
                <span style={{ fontSize: '0.9rem', color: '#64748b', textAlign: 'center' }}>
                    {file
                        ? file.name
                        : 'Click to choose a file or drag and drop'}
                </span>
                {file && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_ACCEPT}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </label>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.5rem 0 1rem' }}>
                Supported: PDF, JPG, JPEG, PNG, DOCX · Max {MAX_MB} MB
            </p>

            {/* Upload button */}
            <button
                onClick={handleUpload}
                disabled={!file || status === 'uploading'}
                type="button"
                style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: !file || status === 'uploading' ? '#e2e8f0' : '#2563eb',
                    color: !file || status === 'uploading' ? '#94a3b8' : 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: !file || status === 'uploading' ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '44px',
                }}
            >
                {status === 'uploading' ? 'Uploading…' : 'Upload to WardRound'}
            </button>

            {/* Status messages */}
            {status === 'success' && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#166534',
                }}>
                    ✅ Document uploaded successfully. It is being processed for AI context.
                    {resultUrl && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#4ade80', wordBreak: 'break-all' }}>
                            Stored at: {resultUrl}
                        </div>
                    )}
                </div>
            )}

            {status === 'error' && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#991b1b',
                }}>
                    ❌ {errorMsg}
                </div>
            )}
        </div>
    );
}
