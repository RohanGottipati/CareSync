import React from 'react';

/**
 * MedicationFlags — Sentinel Results Display
 *
 * Props:
 *   results  — array of { name, clientId, status, summary }
 *   loading  — bool
 *   error    — string | null
 *   triggeredAt — ISO string
 */
export default function MedicationFlags({ results, loading, error, triggeredAt }) {
    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                Running sentinel across all clients…
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '1rem 1.25rem', borderRadius: '10px',
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#b91c1c', fontSize: '0.875rem',
            }}>⚠️ {error}</div>
        );
    }

    if (!results) return null;

    if (results.length === 0) {
        return (
            <div style={{
                padding: '1.25rem', borderRadius: '12px',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#166534', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
                ✅ Sentinel ran successfully — no clients in the database yet.
            </div>
        );
    }

    return (
        <div>
            {triggeredAt && (
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    Last run: {new Date(triggeredAt).toLocaleString('en-CA', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {results.map(r => {
                    const flagged = r.status === 'FLAGGED';
                    const clear = r.status === 'CLEAR';
                    return (
                        <div key={r.clientId || r.name} style={{
                            padding: '0.85rem 1rem', borderRadius: '10px',
                            border: `1px solid ${flagged ? '#fecaca' : clear ? '#bbf7d0' : '#e2e8f0'}`,
                            background: flagged ? '#fef2f2' : clear ? '#f0fdf4' : '#f8fafc',
                        }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', marginBottom: '0.35rem',
                            }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                                    {r.name}
                                </span>
                                <span style={{
                                    padding: '0.15rem 0.65rem', borderRadius: '9999px',
                                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                                    background: flagged ? '#fee2e2' : clear ? '#dcfce7' : '#f1f5f9',
                                    color: flagged ? '#b91c1c' : clear ? '#15803d' : '#64748b',
                                }}>
                                    {r.status}
                                </span>
                            </div>
                            {r.summary && (
                                <p style={{
                                    margin: 0, fontSize: '0.82rem', color: '#475569',
                                    lineHeight: 1.5, whiteSpace: 'pre-wrap',
                                }}>
                                    {r.summary.length > 200 ? r.summary.substring(0, 200) + '…' : r.summary}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
