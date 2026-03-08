import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../useApi';

/**
 * BriefingCard
 *
 * Props:
 *   clientId — string UUID (required to fetch)
 *   role      — 'psw' | 'coordinator' (optional, for display copy)
 */

const SkeletonLine = ({ w = '100%' }) => (
    <div style={{
        height: '13px', borderRadius: '4px',
        background: 'linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)',
        backgroundSize: '400% 100%',
        animation: 'shimmer 1.4s ease infinite',
        width: w, marginBottom: '8px',
    }} />
);

export default function BriefingCard({ clientId, role }) {
    const { fetchWithAuth } = useApi();
    const [state, setState] = useState('idle'); // idle | loading | done | error
    const [briefing, setBriefing] = useState(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!clientId) return;
        setState('loading');
        setError('');
        try {
            const data = await fetchWithAuth(`/briefings/${clientId}`);
            setBriefing(data);
            setState('done');
        } catch (err) {
            setError(err.message || 'Could not load briefing');
            setState('error');
        }
    }, [clientId, fetchWithAuth]);

    // Auto-load when clientId changes
    useEffect(() => { load(); }, [load]);

    const isFlagged = briefing?.briefing &&
        /FLAGGED|⚠|flag|concern|MISSED/i.test(briefing.briefing);

    /* ── styles ──────────────────────────────────────────── */
    const card = {
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    };
    const header = {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg,#eff6ff 0%,#f8fafc 100%)',
    };

    return (
        <>
            {/* shimmer keyframe */}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

            <div style={card}>
                {/* Card header */}
                <div style={header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                            background: 'linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {/* brain icon */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.5 2a2.5 2.5 0 0 1 5 0v.5a2.5 2.5 0 0 1-5 0V2z" />
                                <path d="M4 7h16M4 12h16M4 17h16" strokeOpacity=".4" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                                Pre-Visit Briefing
                            </div>
                            {briefing?.clientName && (
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {briefing.clientName}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={load}
                        disabled={state === 'loading' || !clientId}
                        title="Refresh briefing"
                        type="button"
                        style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.4rem 0.85rem', minHeight: '34px',
                            fontSize: '0.78rem', fontWeight: 600,
                            border: '1px solid #e2e8f0', borderRadius: '8px',
                            background: 'white', color: '#2563eb',
                            cursor: state === 'loading' || !clientId ? 'not-allowed' : 'pointer',
                            opacity: !clientId ? 0.5 : 1,
                            transition: 'background 0.15s',
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ pointerEvents: 'none', flexShrink: 0 }}>
                            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        {state === 'loading' ? 'Generating…' : 'Refresh'}
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {!clientId && (
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                            Select a client above to load their briefing.
                        </p>
                    )}

                    {clientId && state === 'loading' && (
                        <div>
                            <SkeletonLine w="90%" />
                            <SkeletonLine w="75%" />
                            <SkeletonLine w="85%" />
                            <SkeletonLine w="60%" />
                            <SkeletonLine w="80%" />
                        </div>
                    )}

                    {state === 'error' && (
                        <div style={{
                            padding: '0.85rem 1rem', borderRadius: '10px',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            fontSize: '0.875rem', color: '#b91c1c',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {state === 'done' && briefing && (
                        <>
                            {/* Sentinel flag banner */}
                            {isFlagged && (
                                <div style={{
                                    marginBottom: '1rem', padding: '0.75rem 1rem',
                                    borderRadius: '10px', border: '1px solid #fecaca',
                                    background: '#fef2f2', fontSize: '0.85rem', color: '#b91c1c',
                                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                                }}>
                                    ⚠️ Medication sentinel flag detected — review carefully before your visit.
                                </div>
                            )}

                            {/* Briefing text */}
                            <div style={{
                                fontSize: '0.925rem', lineHeight: 1.75,
                                color: '#1e293b', whiteSpace: 'pre-wrap',
                            }}>
                                {briefing.briefing}
                            </div>

                            {/* Footer timestamp */}
                            {briefing.generatedAt && (
                                <div style={{
                                    marginTop: '1rem', paddingTop: '0.75rem',
                                    borderTop: '1px solid #f1f5f9',
                                    fontSize: '0.72rem', color: '#94a3b8',
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                }}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    Generated {new Date(briefing.generatedAt).toLocaleString('en-CA', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
