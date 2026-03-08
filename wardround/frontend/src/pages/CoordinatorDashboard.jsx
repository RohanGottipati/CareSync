import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../useApi';
import MedicationFlags from '../components/MedicationFlags';

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
};
const btnGhost = {
    padding: '0.45rem 0.9rem', border: '1px solid #e2e8f0', borderRadius: '8px',
    background: 'white', color: '#475569', fontWeight: 500, fontSize: '0.82rem',
    cursor: 'pointer',
};
const btnDanger = {
    padding: '0.35rem 0.7rem', border: '1px solid #fecaca', borderRadius: '6px',
    background: '#fef2f2', color: '#b91c1c', fontWeight: 600, fontSize: '0.78rem',
    cursor: 'pointer',
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
                                            <button style={btnGhost} onClick={() => setEditId(c.id === editId ? null : c.id)}>
                                                {c.id === editId ? 'Cancel' : 'Edit'}
                                            </button>
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
                style={{
                    ...btnPrimary, marginBottom: '1.25rem',
                    background: loading
                        ? '#e2e8f0'
                        : 'linear-gradient(135deg,#f59e0b 0%,#d97706 100%)',
                    color: loading ? '#94a3b8' : 'white',
                }}
            >
                {loading ? '⏳ Running Sentinel…' : '▶ Run Sentinel Now'}
            </button>

            <MedicationFlags results={results} loading={loading} error={error} triggeredAt={triggeredAt} />
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
];

export default function CoordinatorDashboard() {
    const [activeTab, setActiveTab] = useState('clients');

    const tabBar = {
        display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
        borderBottom: '2px solid #f1f5f9', paddingBottom: '0',
    };
    const tabBtn = (id) => ({
        padding: '0.55rem 1.1rem', border: 'none', background: 'none',
        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
        color: activeTab === id ? '#2563eb' : '#64748b',
        borderBottom: `2px solid ${activeTab === id ? '#2563eb' : 'transparent'}`,
        marginBottom: '-2px', transition: 'color 0.15s',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
    });

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                        Coordinator Dashboard
                    </h1>
                    <span style={{
                        display: 'inline-flex', padding: '0.2rem 0.7rem', borderRadius: '9999px',
                        background: '#f0fdf4', border: '1px solid #bbf7d0',
                        color: '#15803d', fontSize: '0.72rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>Coordinator</span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    Manage clients, schedule assignments, and review overnight sentinel reports.
                </p>
            </div>

            {/* Tab bar */}
            <div style={tabBar}>
                {TABS.map(t => (
                    <button key={t.id} style={tabBtn(t.id)} onClick={() => setActiveTab(t.id)}>
                        <span>{t.icon}</span> {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'assignments' && <AssignmentsTab />}
            {activeTab === 'sentinel' && <SentinelTab />}
        </div>
    );
}
