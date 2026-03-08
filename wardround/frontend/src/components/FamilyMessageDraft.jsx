import React, { useState } from 'react';
import { useApi } from '../useApi';

/**
 * FamilyMessageDraft
 *
 * Props:
 *   clientId — string, the selected client's UUID (required)
 *
 * Shows a "Generate Drafts" button that calls POST /api/family/draft.
 * Renders two editable draft cards side by side, one per family member.
 */

function DraftCard({ draft, index }) {
    const [text, setText] = useState(draft.message);
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const roleColors = [
        { bg: '#eff6ff', border: '#bfdbfe', badge: '#2563eb', badgeBg: '#dbeafe' },
        { bg: '#f0fdf4', border: '#bbf7d0', badge: '#059669', badgeBg: '#dcfce7' },
    ];
    const colors = roleColors[index % roleColors.length];

    return (
        <div style={{
            flex: '1 1 0',
            minWidth: 0,
            border: `1px solid ${colors.border}`,
            borderRadius: '14px',
            background: colors.bg,
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
        }}>
            {/* Header */}
            <div>
                <span style={{
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.65rem', borderRadius: '9999px',
                    background: colors.badgeBg, color: colors.badge,
                    border: `1px solid ${colors.border}`,
                }}>
                    {draft.role}
                </span>
                <h3 style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    To: {draft.recipient}
                </h3>
            </div>

            {/* Editable draft */}
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={8}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    lineHeight: 1.7,
                    color: '#334155',
                    background: 'white',
                    resize: 'vertical',
                    outline: 'none',
                }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={copy} style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.8rem', fontWeight: 600,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    background: 'white', color: colors.badge,
                    cursor: 'pointer', transition: 'background 0.15s',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '36px',
                }}>
                    {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
                <button type="button" onClick={() => alert('Email/send integration coming soon.')} style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '0.8rem', fontWeight: 600,
                    border: 'none',
                    borderRadius: '8px',
                    background: colors.badge, color: 'white',
                    cursor: 'pointer', opacity: 0.9, transition: 'opacity 0.15s',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: '36px',
                }}
                    onMouseOver={e => e.currentTarget.style.opacity = '1'}
                    onMouseOut={e => e.currentTarget.style.opacity = '0.9'}
                >
                    ✉️ Send
                </button>
            </div>
        </div>
    );
}

export default function FamilyMessageDraft({ clientId }) {
    const { fetchWithAuth } = useApi();
    const [drafts, setDrafts] = useState(null);  // null | [{recipient, role, message}]
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [context, setContext] = useState('');

    const generate = async () => {
        if (!clientId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWithAuth('/family/draft', {
                method: 'POST',
                body: JSON.stringify({ clientId, context: context.trim() || undefined }),
            });
            setDrafts(data.drafts);
        } catch (err) {
            setError(err.message || 'Failed to generate drafts');
        } finally {
            setLoading(false);
        }
    };

    /* ── styles ──────────────────────────────────────────── */
    const card = {
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem 1.75rem',
        marginBottom: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
    };
    const divider = { height: '1px', background: 'var(--border)', margin: '1rem 0' };

    return (
        <div style={card}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                    </svg>
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Family Message Drafts
                    </h2>
                    {drafts && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                            AI-generated · edit before sending
                        </p>
                    )}
                </div>
            </div>

            {!clientId && (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select a client to generate drafts.</p>
            )}

            {clientId && (
                <>
                    {/* Optional context input */}
                    <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' }}>
                            Additional context (optional)
                        </label>
                        <input
                            type="text"
                            value={context}
                            onChange={e => setContext(e.target.value)}
                            placeholder="e.g. Client had a fall yesterday, family should know"
                            style={{
                                width: '100%', boxSizing: 'border-box',
                                padding: '0.55rem 0.75rem',
                                border: '1px solid var(--border)', borderRadius: '8px',
                                fontSize: '0.9rem', color: 'var(--text-main)',
                            }}
                        />
                    </div>

                    <button type="button" onClick={generate} disabled={loading} style={{
                        padding: '0.6rem 1.25rem',
                        background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: loading ? '#94a3b8' : 'white',
                        border: 'none', borderRadius: '10px',
                        fontSize: '0.9rem', fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s', marginBottom: '0.75rem',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minHeight: '42px',
                    }}>
                        {loading ? 'Generating…' : drafts ? '↻ Regenerate Drafts' : '✦ Generate Drafts'}
                    </button>

                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: '#fef2f2', border: '1px solid #fecaca',
                            borderRadius: '10px', fontSize: '0.85rem', color: '#b91c1c',
                            marginBottom: '0.75rem',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {drafts && !loading && (
                        <>
                            <div style={divider} />
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {drafts.map((draft, i) => (
                                    <DraftCard key={draft.recipient} draft={draft} index={i} />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
