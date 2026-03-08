import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../useApi';
import MedicationFlags from '../components/MedicationFlags';
import DocumentUpload from '../components/DocumentUpload';

/* ──────────────────────────────────────────────────────────────
   Shared UI primitives
────────────────────────────────────────────────────────────── */
const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.875rem', color: '#0f172a', background: 'white',
    outline: 'none',
};
const labelStyle = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: '#64748b', marginBottom: '0.3rem',
};
const btnPrimary = {
    padding: '0.5rem 1.1rem', border: 'none', borderRadius: '8px',
    background: 'linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)',
    color: 'white', fontWeight: 600, fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '36px',
};
const btnGhost = {
    padding: '0.45rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px',
    background: 'white', color: '#475569', fontWeight: 500, fontSize: '0.82rem',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '34px',
};
const btnDanger = {
    padding: '0.35rem 0.7rem', border: '1px solid #fecaca', borderRadius: '6px',
    background: '#fef2f2', color: '#b91c1c', fontWeight: 600, fontSize: '0.78rem',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '32px',
};
const card = {
    background: 'white', border: '1px solid #e2e8f0',
    borderRadius: '14px', marginBottom: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,.05)',
};
const cardHeader = {
    padding: '0.9rem 1.25rem', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'linear-gradient(135deg,#f8fafc 0%,#ffffff 100%)',
    borderRadius: '14px 14px 0 0',
};
const tableStyle = {
    width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem',
};
const th = {
    textAlign: 'left', padding: '0.6rem 0.85rem',
    color: '#64748b', fontSize: '0.72rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '2px solid #f1f5f9', background: '#f8fafc',
};
const td = {
    padding: '0.7rem 0.85rem', borderBottom: '1px solid #f8fafc',
    color: '#1e293b', verticalAlign: 'top',
};
const muted = { color: '#94a3b8', fontSize: '0.8rem' };

/* ──────────────────────────────────────────────────────────────
   CLIENT FORM (Add / Edit)
────────────────────────────────────────────────────────────── */
function ClientForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial || {
        name: '', dateOfBirth: '', conditions: '', medications: '', notes: '',
    });
    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    return (
        <div style={{
            padding: '1.25rem', background: '#f8fafc',
            borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem',
        }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input style={inputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Margaret Chen" />
                </div>
                <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <input style={inputStyle} type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                </div>
                <div>
                    <label style={labelStyle}>Conditions</label>
                    <input style={inputStyle} value={form.conditions} onChange={set('conditions')} placeholder="e.g. Diabetes T2, Dementia" />
                </div>
                <div>
                    <label style={labelStyle}>Medications</label>
                    <input style={inputStyle} value={form.medications} onChange={set('medications')} placeholder="e.g. Metformin 500mg, Donepezil 10mg" />
                </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
                <label style={labelStyle}>Care Notes</label>
                <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                    value={form.notes} onChange={set('notes')} placeholder="Behavioural notes, mobility, family contacts…" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button style={btnPrimary} onClick={() => onSave(form)} disabled={saving || !form.name}>
                    {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Client'}
                </button>
                <button style={btnGhost} onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────
   CLIENTS TAB
────────────────────────────────────────────────────────────── */
function ClientsTab() {
    const { fetchWithAuth } = useApi();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [error, setError] = useState('');

    const reload = useCallback(() => {
        setLoading(true);
        fetchWithAuth('/clients')
            .then(d => setClients(d.clients || []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [fetchWithAuth]);

    useEffect(() => { reload(); }, [reload]);

    const addClient = async (form) => {
        setSaving(true);
        try {
            await fetchWithAuth('/clients', { method: 'POST', body: JSON.stringify(form) });
            setShowAdd(false);
            reload();
        } catch (e) { setError(e.message); } finally { setSaving(false); }
    };

    const editClient = async (id, form) => {
        setSaving(true);
        try {
            await fetchWithAuth(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(form) });
            setEditId(null);
            reload();
        } catch (e) { setError(e.message); } finally { setSaving(false); }
    };

    const removeClient = async (id, name) => {
        if (!window.confirm(`Remove ${name}? This cannot be undone.`)) return;
        setRemovingId(id);
        try {
            await fetchWithAuth(`/clients/${id}`, { method: 'DELETE' });
            reload();
        } catch (e) { setError(e.message); } finally { setRemovingId(null); }
    };

    return (
        <div>
            {error && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                    {loading ? 'Loading…' : `${clients.length} client${clients.length !== 1 ? 's' : ''} registered`}
                </p>
                {!showAdd && (
                    <button style={btnPrimary} onClick={() => setShowAdd(true)}>
                        + Add Client
                    </button>
                )}
            </div>

            {showAdd && (
                <ClientForm onSave={addClient} onCancel={() => setShowAdd(false)} saving={saving} />
            )}

            {!loading && clients.length === 0 && !showAdd && (
                <div style={{
                    padding: '2.5rem', textAlign: 'center',
                    background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0',
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        No clients yet. Add one to get started.
                    </p>
                </div>
            )}

            {clients.length > 0 && (
                <div style={card}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={th}>Name</th>
                                <th style={th}>Conditions</th>
                                <th style={th}>Medications</th>
                                <th style={th}>DOB</th>
                                <th style={th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map(c => (
                                <React.Fragment key={c.id}>
                                    <tr>
                                        <td style={{ ...td, fontWeight: 600 }}>{c.name}</td>
                                        <td style={td}>
                                            <span style={muted}>{c.conditions || '—'}</span>
                                        </td>
                                        <td style={td}>
                                            <span style={muted}>{c.medications || '—'}</span>
                                        </td>
                                        <td style={{ ...td, ...muted }}>
                                            {c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString('en-CA') : '—'}
                                        </td>
                                        <td style={{ ...td, textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                                <button
                                                    type="button"
                                                    style={btnGhost}
                                                    onClick={() => setEditId(c.id === editId ? null : c.id)}
                                                >
                                                    <span style={{ pointerEvents: 'none' }}>{c.id === editId ? 'Cancel' : 'Edit'}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{ ...btnDanger, opacity: removingId === c.id ? 0.6 : 1 }}
                                                    onClick={() => removeClient(c.id, c.name)}
                                                    disabled={removingId === c.id}
                                                >
                                                    <span style={{ pointerEvents: 'none' }}>{removingId === c.id ? 'Removing…' : 'Remove'}</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {editId === c.id && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '0.5rem 0.85rem' }}>
                                                <ClientForm
                                                    initial={{ name: c.name, dateOfBirth: c.date_of_birth || '', conditions: c.conditions || '', medications: c.medications || '', notes: c.notes || '' }}
                                                    onSave={(form) => editClient(c.id, form)}
                                                    onCancel={() => setEditId(null)}
                                                    saving={saving}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────
   ASSIGNMENTS TAB
────────────────────────────────────────────────────────────── */
function AssignmentsTab() {
    const { fetchWithAuth } = useApi();
    const [assignments, setAssignments] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({ clientId: '', pswUserId: '', shiftStart: '', shiftEnd: '' });
    const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

    const reload = useCallback(() => {
        setLoading(true);
        Promise.all([
            fetchWithAuth('/clients/assignments/all'),
            fetchWithAuth('/clients'),
        ]).then(([aData, cData]) => {
            setAssignments(aData.assignments || []);
            setClients(cData.clients || []);
        }).catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [fetchWithAuth]);

    useEffect(() => { reload(); }, [reload]);

    const add = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                shiftStart: form.shiftStart ? new Date(form.shiftStart).toISOString() : '',
                shiftEnd: form.shiftEnd ? new Date(form.shiftEnd).toISOString() : '',
            };
            await fetchWithAuth('/clients/assignments', { method: 'POST', body: JSON.stringify(payload) });
            setShowForm(false);
            setForm({ clientId: '', pswUserId: '', shiftStart: '', shiftEnd: '' });
            reload();
        } catch (e) { setError(e.message); } finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!confirm('Remove this assignment?')) return;
        try {
            await fetchWithAuth(`/clients/assignments/${id}`, { method: 'DELETE' });
            reload();
        } catch (e) { setError(e.message); }
    };

    const fmt = (s) => {
        if (!s) return '—';
        return new Date(s).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div>
            {error && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                    {loading ? 'Loading…' : `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}`}
                </p>
                {!showForm && (
                    <button style={btnPrimary} onClick={() => setShowForm(true)}>+ Assign PSW</button>
                )}
            </div>

            {showForm && (
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                            <label style={labelStyle}>Client *</label>
                            <select style={inputStyle} value={form.clientId} onChange={setF('clientId')}>
                                <option value="">— select client —</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>PSW Auth0 User ID *</label>
                            <input style={inputStyle} value={form.pswUserId} onChange={setF('pswUserId')} placeholder="auth0|…" />
                        </div>
                        <div>
                            <label style={labelStyle}>Shift Start *</label>
                            <input style={inputStyle} type="datetime-local" value={form.shiftStart} onChange={setF('shiftStart')} />
                        </div>
                        <div>
                            <label style={labelStyle}>Shift End *</label>
                            <input style={inputStyle} type="datetime-local" value={form.shiftEnd} onChange={setF('shiftEnd')} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={btnPrimary} onClick={add} disabled={saving || !form.clientId || !form.pswUserId || !form.shiftStart || !form.shiftEnd}>
                            {saving ? 'Saving…' : 'Create Assignment'}
                        </button>
                        <button style={btnGhost} onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            {!loading && assignments.length === 0 && !showForm && (
                <div style={{
                    padding: '2.5rem', textAlign: 'center',
                    background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0',
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        No assignments yet. Assign a PSW to a client shift to get started.
                    </p>
                </div>
            )}

            {assignments.length > 0 && (
                <div style={card}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={th}>Client</th>
                                <th style={th}>PSW User ID</th>
                                <th style={th}>Shift Start</th>
                                <th style={th}>Shift End</th>
                                <th style={th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map(a => (
                                <tr key={a.id}>
                                    <td style={{ ...td, fontWeight: 600 }}>{a.client_name}</td>
                                    <td style={{ ...td, ...muted, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        {a.psw_user_id?.substring(0, 24)}…
                                    </td>
                                    <td style={{ ...td, ...muted }}>{fmt(a.shift_start)}</td>
                                    <td style={{ ...td, ...muted }}>{fmt(a.shift_end)}</td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        <button style={btnDanger} onClick={() => remove(a.id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────
   SENTINEL TAB
────────────────────────────────────────────────────────────── */
function SentinelTab() {
    const { fetchWithAuth } = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);
    const [triggeredAt, setTriggeredAt] = useState(null);

    const run = async () => {
        setLoading(true); setError(''); setResults(null);
        try {
            const data = await fetchWithAuth('/debug/sentinel', { method: 'POST' });
            setResults(data.clients);
            setTriggeredAt(data.triggeredAt);
        } catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <div style={{
                marginBottom: '1.25rem', padding: '1rem 1.25rem',
                background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a',
                fontSize: '0.875rem', color: '#92400e',
            }}>
                <strong>Medication Sentinel</strong> — Runs nightly at 2 AM in production. Use <em>Run Now</em> to
                trigger it immediately and review each client's medication status.
            </div>

            <button
                onClick={run}
                disabled={loading}
                type="button"
                style={{
                    ...btnPrimary, marginBottom: '1.25rem',
                    background: loading
                        ? '#e2e8f0'
                        : 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
                    color: loading ? '#94a3b8' : 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                }}
            >
                <span style={{ pointerEvents: 'none' }}>{loading ? '⏳ Running Sentinel…' : '▶ Run Sentinel Now'}</span>
            </button>

            <MedicationFlags results={results} loading={loading} error={error} triggeredAt={triggeredAt} />
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────
   DOCUMENTS TAB
────────────────────────────────────────────────────────────── */
function DocumentsTab() {
    const { fetchWithAuth } = useApi();
    const [clients, setClients] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [docs, setDocs] = useState([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [sentinel, setSentinel] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWithAuth('/clients')
            .then(d => {
                const list = d.clients || [];
                setClients(list);
                if (list.length === 1) setSelectedId(list[0].id);
            })
            .catch(e => setError(e.message));
    }, [fetchWithAuth]);

    const loadDocs = useCallback(async (clientId) => {
        if (!clientId) { setDocs([]); setSentinel(null); return; }
        setLoadingDocs(true);
        setError('');
        try {
            const [docData, sentinelData] = await Promise.all([
                fetchWithAuth(`/documents?clientId=${clientId}`),
                fetchWithAuth(`/clients/${clientId}/sentinel`).catch(() => ({ sentinel: null })),
            ]);
            setDocs(docData.documents || []);
            setSentinel(sentinelData.sentinel || null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoadingDocs(false);
        }
    }, [fetchWithAuth]);

    useEffect(() => { loadDocs(selectedId); }, [selectedId, loadDocs]);

    const selectedClient = clients.find(c => c.id === selectedId);

    const fmtDate = (d) => d ? new Date(d).toLocaleString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div>
            {error && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Client selector */}
            <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Select Client</label>
                <select style={{ ...inputStyle, maxWidth: 320 }} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                    <option value="">— select client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Sentinel banner for selected client */}
            {selectedId && sentinel?.status === 'FLAGGED' && (
                <div style={{
                    marginBottom: '1.25rem', padding: '0.85rem 1rem',
                    borderRadius: '12px', border: '1.5px solid #fca5a5',
                    background: 'linear-gradient(135deg,#fef2f2 0%,#fff5f5 100%)',
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                    boxShadow: '0 2px 6px rgba(220,38,38,.08)',
                }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚨</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#b91c1c', marginBottom: '0.2rem' }}>
                            Sentinel Flag — {selectedClient?.name}
                        </div>
                        <div style={{ fontSize: '0.83rem', color: '#dc2626', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {sentinel.summary_text}
                        </div>
                        {sentinel.checked_at && (
                            <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '0.3rem', opacity: 0.75 }}>
                                Last checked: {fmtDate(sentinel.checked_at)}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload area */}
            {selectedId && (
                <>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <DocumentUpload clientId={selectedId} onUploadSuccess={() => loadDocs(selectedId)} />
                    </div>

                    {/* Document list */}
                    <div style={card}>
                        <div style={cardHeader}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                                Uploaded Documents {selectedClient && `— ${selectedClient.name}`}
                            </span>
                            <button
                                type="button"
                                style={btnGhost}
                                onClick={() => loadDocs(selectedId)}
                                disabled={loadingDocs}
                            >
                                {loadingDocs ? 'Loading…' : '↻ Refresh'}
                            </button>
                        </div>
                        {loadingDocs && (
                            <div style={{ padding: '1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>Loading…</div>
                        )}
                        {!loadingDocs && docs.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>No documents uploaded yet.</p>
                            </div>
                        )}
                        {!loadingDocs && docs.length > 0 && (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={th}>Filename</th>
                                        <th style={th}>Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docs.map(d => (
                                        <tr key={d.id}>
                                            <td style={{ ...td, fontWeight: 500 }}>
                                                {d.storage_url
                                                    ? <a href={d.storage_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>{d.filename}</a>
                                                    : d.filename
                                                }
                                            </td>
                                            <td style={{ ...td, ...muted }}>{fmtDate(d.uploaded_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {!selectedId && (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Select a client to manage their documents.</p>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────
   ADMIN TAB — manage users without roles
────────────────────────────────────────────────────────────── */
function AdminTab() {
    const { fetchWithAuth } = useApi();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRoles, setSelectedRoles] = useState({});   // { userId: 'psw' }
    const [saving, setSaving] = useState({});                  // { userId: true }
    const [success, setSuccess] = useState({});                // { userId: 'psw' }

    const reload = useCallback(() => {
        setLoading(true);
        setError('');
        fetchWithAuth('/admin/users/unassigned')
            .then(d => setUsers(d.users || []))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [fetchWithAuth]);

    useEffect(() => { reload(); }, [reload]);

    const assignRole = async (userId) => {
        const role = selectedRoles[userId];
        if (!role) return;
        setSaving(s => ({ ...s, [userId]: true }));
        try {
            await fetchWithAuth(`/admin/users/${encodeURIComponent(userId)}/role`, {
                method: 'POST',
                body: JSON.stringify({ role }),
            });
            setSuccess(s => ({ ...s, [userId]: role }));
            // Remove from list after brief delay so user sees the success message
            setTimeout(() => {
                setUsers(u => u.filter(x => x.user_id !== userId));
                setSuccess(s => { const n = { ...s }; delete n[userId]; return n; });
            }, 1500);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(s => { const n = { ...s }; delete n[userId]; return n; });
        }
    };

    const roleBadge = (role) => {
        const colors = {
            coordinator: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d' },
            psw: { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8' },
            family: { bg: '#fef3c7', border: '#fde68a', color: '#92400e' },
        };
        const c = colors[role] || { bg: '#f1f5f9', border: '#e2e8f0', color: '#475569' };
        return {
            display: 'inline-flex', padding: '0.15rem 0.55rem', borderRadius: '9999px',
            background: c.bg, border: `1px solid ${c.border}`, color: c.color,
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
        };
    };

    return (
        <div>
            {error && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    ⚠️ {error}
                    <button onClick={() => setError('')} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', color: '#b91c1c', fontWeight: 700 }}>✕</button>
                </div>
            )}

            <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', fontSize: '0.875rem', color: '#1e40af' }}>
                <strong>User Role Management</strong> — Users listed below have signed up but have not been assigned a role. Select a role and click <em>Grant</em> to give them access.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                    {loading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''} without a role`}
                </p>
                <button style={btnGhost} onClick={reload} disabled={loading}>↻ Refresh</button>
            </div>

            {!loading && users.length === 0 && (
                <div style={{
                    padding: '2.5rem', textAlign: 'center',
                    background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0',
                }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        All users have roles assigned. Nothing to do!
                    </p>
                </div>
            )}

            {users.length > 0 && (
                <div style={card}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={th}>Email</th>
                                <th style={th}>Provider</th>
                                <th style={th}>Name</th>
                                <th style={th}>Signed Up</th>
                                <th style={th}>Role</th>
                                <th style={th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.user_id}>
                                    <td style={{ ...td, fontWeight: 600 }}>{u.email}</td>
                                    <td style={td}>
                                        <span style={{
                                            display: 'inline-flex', padding: '0.15rem 0.5rem', borderRadius: '9999px',
                                            background: u.provider === 'google-oauth2' ? '#fef3c7' : u.provider === 'windowslive' ? '#e0f2fe' : '#f1f5f9',
                                            border: `1px solid ${u.provider === 'google-oauth2' ? '#fde68a' : u.provider === 'windowslive' ? '#bae6fd' : '#e2e8f0'}`,
                                            color: u.provider === 'google-oauth2' ? '#92400e' : u.provider === 'windowslive' ? '#0369a1' : '#475569',
                                            fontSize: '0.7rem', fontWeight: 600,
                                        }}>
                                            {u.provider === 'google-oauth2' ? 'Google' : u.provider === 'windowslive' ? 'Microsoft' : u.provider === 'auth0' ? 'Email/Pass' : u.provider}
                                        </span>
                                    </td>
                                    <td style={{ ...td, ...muted }}>{u.name || '—'}</td>
                                    <td style={{ ...td, ...muted }}>
                                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-CA') : '—'}
                                    </td>
                                    <td style={td}>
                                        {success[u.user_id] ? (
                                            <span style={roleBadge(success[u.user_id])}>{success[u.user_id]}</span>
                                        ) : (
                                            <select
                                                style={{ ...inputStyle, maxWidth: 140 }}
                                                value={selectedRoles[u.user_id] || ''}
                                                onChange={e => setSelectedRoles(s => ({ ...s, [u.user_id]: e.target.value }))}
                                            >
                                                <option value="">— select —</option>
                                                <option value="coordinator">Coordinator</option>
                                                <option value="psw">PSW</option>
                                                <option value="family">Family</option>
                                            </select>
                                        )}
                                    </td>
                                    <td style={{ ...td, textAlign: 'right' }}>
                                        {success[u.user_id] ? (
                                            <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.85rem' }}>✓ Granted</span>
                                        ) : (
                                            <button
                                                style={{
                                                    ...btnPrimary,
                                                    opacity: (!selectedRoles[u.user_id] || saving[u.user_id]) ? 0.5 : 1,
                                                    cursor: (!selectedRoles[u.user_id] || saving[u.user_id]) ? 'not-allowed' : 'pointer',
                                                }}
                                                onClick={() => assignRole(u.user_id)}
                                                disabled={!selectedRoles[u.user_id] || saving[u.user_id]}
                                            >
                                                {saving[u.user_id] ? 'Granting…' : 'Grant Role'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────
   MAIN COORDINATOR DASHBOARD
────────────────────────────────────────────────────────────── */
const TABS = [
    { id: 'clients', label: 'Clients', icon: '👤' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'sentinel', label: 'Sentinel', icon: '🛡' },
    { id: 'documents', label: 'Documents', icon: '📂' },
    { id: 'admin', label: 'Admin', icon: '⚙️' },
];

export default function CoordinatorDashboard() {
    const [activeTab, setActiveTab] = useState('clients');

    const tabBar = {
        display: 'flex', gap: '0', marginBottom: '1.5rem',
        borderBottom: '2px solid #f1f5f9', paddingBottom: '0',
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        position: 'relative', zIndex: 10,
    };
    const tabBtn = (id) => ({
        padding: '0.55rem 1.1rem', border: 'none', background: 'none',
        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
        color: activeTab === id ? '#2563eb' : '#64748b',
        borderBottom: `2px solid ${activeTab === id ? '#2563eb' : 'transparent'}`,
        marginBottom: '-2px', transition: 'color 0.15s',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        minHeight: '44px', minWidth: '100px', whiteSpace: 'nowrap', flexShrink: 0,
    });

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                        Coordinator Dashboard
                    </h1>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    Manage clients, schedule assignments, and review overnight sentinel reports.
                </p>
            </div>

            {/* Tab bar */}
            <div style={tabBar}>
                {TABS.map(t => (
                    <button key={t.id} style={tabBtn(t.id)} onClick={() => setActiveTab(t.id)} type="button">
                        <span style={{ pointerEvents: 'none' }}>{t.icon}</span>
                        <span style={{ pointerEvents: 'none' }}>{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'assignments' && <AssignmentsTab />}
            {activeTab === 'sentinel' && <SentinelTab />}
            {activeTab === 'documents' && <DocumentsTab />}
            {activeTab === 'admin' && <AdminTab />}
        </div>
    );
}
