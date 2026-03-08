import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '../useApi';

export default function FamilyPortal() {
    const { user } = useAuth0();
    const { fetchWithAuth } = useApi();
    const firstName = user?.name?.split(' ')[0] || 'there';

    const [clients, setClients] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientsError, setClientsError] = useState('');

    const [summaries, setSummaries] = useState([]);
    const [loadingSummaries, setLoadingSummaries] = useState(false);
    const [summariesError, setSummariesError] = useState('');

    useEffect(() => {
        fetchWithAuth('/clients')
            .then(data => {
                const list = data.clients || [];
                setClients(list);
                if (list.length === 1) setSelectedId(list[0].id);
            })
            .catch(err => setClientsError(err.message))
            .finally(() => setLoadingClients(false));
    }, [fetchWithAuth]);

    const loadSummaries = useCallback(async (clientId) => {
        if (!clientId) { setSummaries([]); return; }
        setLoadingSummaries(true);
        setSummariesError('');
        try {
            const data = await fetchWithAuth(`/family/summaries?clientId=${clientId}`);
            setSummaries(data.summaries || []);
        } catch (err) {
            setSummariesError(err.message || 'Could not load updates');
        } finally {
            setLoadingSummaries(false);
        }
    }, [fetchWithAuth]);

    useEffect(() => { loadSummaries(selectedId); }, [selectedId, loadSummaries]);

    const selectedClient = clients.find(c => c.id === selectedId);

    /* ── styles ─── */
    const page = { maxWidth: '820px', margin: '0 auto' };
    const roleChip = {
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        padding: '0.2rem 0.7rem', borderRadius: '9999px',
        background: '#faf5ff', color: '#7c3aed',
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        border: '1px solid #ede9fe',
    };
    const infoBox = {
        marginBottom: '1.5rem', padding: '1rem 1.25rem',
        borderRadius: '12px', background: '#faf5ff',
        border: '1px solid #ede9fe',
        fontSize: '0.875rem', color: '#6d28d9', lineHeight: 1.6,
    };
    const card = {
        background: 'white', border: '1px solid #e2e8f0',
        borderRadius: '16px', padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    };
    const summaryCard = (i) => ({
        background: i === 0 ? '#faf5ff' : '#f8fafc',
        border: `1px solid ${i === 0 ? '#ede9fe' : '#e2e8f0'}`,
        borderRadius: '12px', padding: '1.1rem 1.25rem',
        marginBottom: '0.85rem',
    });
    const dateBadge = {
        display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
        letterSpacing: '0.05em', textTransform: 'uppercase',
        padding: '0.2rem 0.65rem', borderRadius: '9999px',
        background: '#ede9fe', color: '#7c3aed',
        marginBottom: '0.6rem',
    };
    const emptyBox = {
        padding: '2.5rem', textAlign: 'center',
        background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0',
    };

    return (
        <div style={page}>
            {/* Header */}
            <div style={{ marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                        Family Portal
                    </h1>
                    <span style={roleChip}>Family</span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    Daily care updates, prepared each night by the WardRound Care Team.
                </p>
            </div>

            {/* Info callout */}
            <div style={infoBox}>
                <strong>How it works:</strong> Every night, the WardRound Care Team reviews your loved one's
                daily care logs and prepares a personalised update for you here. Updates appear each morning
                for the previous day's care.
            </div>

            {/* Client selector */}
            {loadingClients && <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading…</p>}
            {clientsError && (
                <div style={{
                    marginBottom: '1.25rem', padding: '0.75rem 1rem',
                    borderRadius: '10px', background: '#fef2f2',
                    border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.875rem',
                }}>⚠️ {clientsError}</div>
            )}
            {!loadingClients && clients.length === 0 && !clientsError && (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    No clients found. Please contact your coordinator.
                </p>
            )}
            {!loadingClients && clients.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="family-client" style={{
                        fontSize: '0.8rem', fontWeight: 600, color: '#64748b',
                        display: 'block', marginBottom: '0.4rem',
                    }}>
                        Your Loved One
                    </label>
                    <select
                        id="family-client"
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        style={{
                            padding: '0.55rem 0.85rem',
                            border: '1px solid #e2e8f0', borderRadius: '10px',
                            fontSize: '0.9rem', background: 'white', color: '#0f172a',
                            cursor: 'pointer', minWidth: '240px',
                        }}
                    >
                        {clients.length > 1 && <option value="">— select —</option>}
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}

            {/* Summaries */}
            {selectedId && (
                <div style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                                background: 'linear-gradient(135deg,#8b5cf6 0%,#a78bfa 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                                    Daily Updates
                                    {selectedClient && <span style={{ color: '#64748b', fontWeight: 500 }}> — {selectedClient.name}</span>}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Prepared nightly by the Care Team</div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => loadSummaries(selectedId)}
                            disabled={loadingSummaries}
                            style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                padding: '0.4rem 0.85rem', minHeight: '34px',
                                fontSize: '0.78rem', fontWeight: 600,
                                border: '1px solid #e2e8f0', borderRadius: '8px',
                                background: 'white', color: '#7c3aed',
                                cursor: loadingSummaries ? 'not-allowed' : 'pointer',
                                opacity: loadingSummaries ? 0.6 : 1,
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ pointerEvents: 'none', flexShrink: 0 }}>
                                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                            <span style={{ pointerEvents: 'none' }}>{loadingSummaries ? 'Loading…' : 'Refresh'}</span>
                        </button>
                    </div>

                    {loadingSummaries && (
                        <div>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} style={{
                                    height: 80, borderRadius: 12, marginBottom: 12,
                                    background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
                                    backgroundSize: '400% 100%',
                                    animation: 'shimmer 1.4s ease infinite',
                                }} />
                            ))}
                            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
                        </div>
                    )}

                    {summariesError && !loadingSummaries && (
                        <div style={{
                            padding: '0.85rem 1rem', borderRadius: '10px',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            fontSize: '0.875rem', color: '#b91c1c',
                        }}>
                            ⚠️ {summariesError}
                        </div>
                    )}

                    {!loadingSummaries && !summariesError && summaries.length === 0 && (
                        <div style={emptyBox}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📬</div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, fontWeight: 600 }}>
                                No updates yet
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0.4rem 0 0' }}>
                                Daily updates are prepared each night after care visits are completed.
                                Check back tomorrow morning.
                            </p>
                        </div>
                    )}

                    {!loadingSummaries && summaries.length > 0 && (
                        <div>
                            {summaries.map((s, i) => {
                                const dateLabel = new Date(s.summary_date + 'T12:00:00').toLocaleDateString('en-CA', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                });
                                return (
                                    <div key={s.id || i} style={summaryCard(i)}>
                                        {i === 0 && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                                <span style={{ ...dateBadge, background: '#ede9fe', color: '#7c3aed' }}>
                                                    {dateLabel}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.7rem', fontWeight: 700,
                                                    padding: '0.15rem 0.5rem', borderRadius: '9999px',
                                                    background: '#dcfce7', color: '#15803d',
                                                    border: '1px solid #bbf7d0',
                                                }}>Latest</span>
                                            </div>
                                        )}
                                        {i > 0 && (
                                            <span style={{ ...dateBadge, background: '#f1f5f9', color: '#475569' }}>
                                                {dateLabel}
                                            </span>
                                        )}
                                        <p style={{
                                            margin: 0, fontSize: '0.9rem', lineHeight: 1.75,
                                            color: '#1e293b', whiteSpace: 'pre-wrap',
                                        }}>
                                            {s.summary_text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {!selectedId && !loadingClients && clients.length > 0 && (
                <div style={emptyBox}>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        Select a client above to view their daily updates.
                    </p>
                </div>
            )}
        </div>
    );
}
