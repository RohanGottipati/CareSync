import React, { useState } from 'react';
import { useApi } from '../useApi';

/**
 * VisitLogger
 *
 * Props:
 *   clientId — string, the selected client's UUID (required)
 */

const SESSION_TYPE_OPTIONS = [
    { value: '', label: '— Select session type —' },
    { value: 'Morning', label: '🌅 Morning' },
    { value: 'Afternoon', label: '☀️ Afternoon' },
    { value: 'Evening', label: '🌆 Evening' },
    { value: 'Overnight', label: '🌙 Overnight' },
    { value: 'Medication round', label: '💊 Medication round' },
    { value: 'Personal care', label: '🛁 Personal care' },
    { value: 'Other', label: '📋 Other' },
];

const MOOD_OPTIONS = [
    { value: '', label: '— Select mood —' },
    { value: 'Good', label: '😊 Good' },
    { value: 'Calm', label: '😌 Calm' },
    { value: 'Anxious', label: '😟 Anxious' },
    { value: 'Agitated', label: '😤 Agitated' },
    { value: 'Withdrawn', label: '😶 Withdrawn' },
];

export default function VisitLogger({ clientId }) {
    const { fetchWithAuth } = useApi();

    const [sessionType, setSessionType] = useState('');
    const [medications, setMedications] = useState('');
    const [mood, setMood] = useState('');
    const [observations, setObservations] = useState('');
    const [concern, setConcern] = useState('');
    const [concerns, setConcerns] = useState([]);
    const [showVitals, setShowVitals] = useState(false);
    const [vitals, setVitals] = useState({ bp: '', weight: '', temp: '' });
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState('');

    /* ── concern chip helpers ────────────────────────────── */
    const addConcern = () => {
        const trimmed = concern.trim();
        if (trimmed && !concerns.includes(trimmed)) {
            setConcerns([...concerns, trimmed]);
        }
        setConcern('');
    };

    const removeConcern = (c) => setConcerns(concerns.filter(x => x !== c));

    /* ── submit ──────────────────────────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!clientId) return;
        setStatus('submitting');
        setErrorMsg('');

        // Build notes from medications + observations
        const notesParts = [];
        if (medications) notesParts.push(`Medications given: ${medications}`);
        if (observations) notesParts.push(`Observations: ${observations}`);

        try {
            await fetchWithAuth('/visits', {
                method: 'POST',
                body: JSON.stringify({
                    clientId,
                    notes: notesParts.join('\n'),
                    mood,
                    vitals: {
                        bp: vitals.bp || undefined,
                        weight: vitals.weight || undefined,
                        temp: vitals.temp || undefined,
                    },
                    flaggedConcerns: concerns,
                    sessionType: sessionType || undefined,
                }),
            });

            setStatus('success');
            // Reset after 3 s
            setTimeout(() => {
                setSessionType('');
                setMedications(''); setMood(''); setObservations('');
                setConcerns([]); setConcern('');
                setVitals({ bp: '', weight: '', temp: '' });
                setShowVitals(false);
                setStatus('idle');
            }, 3000);
        } catch (err) {
            setErrorMsg(err.message || 'Failed to submit visit');
            setStatus('error');
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
    const label = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '0.35rem' };
    const inputBase = {
        width: '100%', boxSizing: 'border-box',
        padding: '0.55rem 0.75rem',
        border: '1px solid var(--border)', borderRadius: '8px',
        fontSize: '0.9rem', color: 'var(--text-main)', background: 'white',
        outline: 'none', transition: 'border-color 0.15s',
    };
    const fieldGroup = { marginBottom: '1rem' };
    const divider = { height: '1px', background: 'var(--border)', margin: '1rem 0' };

    /* ── render ──────────────────────────────────────────── */
    return (
        <div style={card}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                </div>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Log Visit</h2>
            </div>

            {/* No client warning */}
            {!clientId && (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Select a client above to log a visit.</p>
            )}

            {clientId && (
                <form onSubmit={handleSubmit}>
                    {/* Session Type */}
                    <div style={fieldGroup}>
                        <label style={label}>Session Type</label>
                        <select value={sessionType} onChange={e => setSessionType(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
                            {SESSION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {/* Medications */}
                    <div style={fieldGroup}>
                        <label style={label}>Medications Given</label>
                        <input
                            type="text"
                            value={medications}
                            onChange={e => setMedications(e.target.value)}
                            placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                            style={inputBase}
                        />
                    </div>

                    {/* Mood */}
                    <div style={fieldGroup}>
                        <label style={label}>Mood</label>
                        <select value={mood} onChange={e => setMood(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
                            {MOOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {/* Observations */}
                    <div style={fieldGroup}>
                        <label style={label}>Observations</label>
                        <textarea
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                            placeholder="Gait, appetite, skin condition, behaviour notes…"
                            rows={3}
                            style={{ ...inputBase, resize: 'vertical', minHeight: '80px' }}
                        />
                    </div>

                    {/* Flagged Concerns */}
                    <div style={fieldGroup}>
                        <label style={label}>Flagged Concerns</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={concern}
                                onChange={e => setConcern(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addConcern(); } }}
                                placeholder="Type a concern and press Enter or Add"
                                style={{ ...inputBase, flex: 1 }}
                            />
                            <button type="button" onClick={addConcern} style={{
                                padding: '0.5rem 0.9rem', fontSize: '0.8rem', fontWeight: 600,
                                background: '#fef3c7', color: '#92400e',
                                border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer',
                                whiteSpace: 'nowrap', flexShrink: 0,
                                display: 'inline-flex', alignItems: 'center',
                            }}>Add</button>
                        </div>
                        {concerns.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                                {concerns.map(c => (
                                    <span key={c} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                        padding: '0.25rem 0.65rem', borderRadius: '9999px',
                                        background: '#fef2f2', border: '1px solid #fecaca',
                                        fontSize: '0.8rem', color: '#b91c1c',
                                    }}>
                                        ⚠️ {c}
                                        <button type="button" onClick={() => removeConcern(c)} style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontSize: '0.8rem', color: '#ef4444',
                                            padding: '0.15rem', lineHeight: 1,
                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            minWidth: '16px', minHeight: '16px',
                                        }}>✕</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Vitals (collapsible) */}
                    <div style={{ marginBottom: '1rem' }}>
                        <button type="button" onClick={() => setShowVitals(v => !v)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.8rem', fontWeight: 600, color: '#2563eb',
                            padding: '0.3rem 0.5rem', margin: '-0.3rem -0.5rem',
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                            <span style={{ pointerEvents: 'none' }}>{showVitals ? '▾' : '▸'}</span>
                            <span style={{ pointerEvents: 'none' }}>Vitals (optional)</span>
                        </button>
                        {showVitals && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.6rem' }}>
                                {[
                                    { key: 'bp', label: 'Blood Pressure', placeholder: '120/80' },
                                    { key: 'weight', label: 'Weight', placeholder: '68 kg' },
                                    { key: 'temp', label: 'Temperature', placeholder: '37.0°C' },
                                ].map(({ key, label: vLabel, placeholder }) => (
                                    <div key={key}>
                                        <label style={label}>{vLabel}</label>
                                        <input
                                            type="text"
                                            value={vitals[key]}
                                            onChange={e => setVitals(v => ({ ...v, [key]: e.target.value }))}
                                            placeholder={placeholder}
                                            style={inputBase}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={divider} />

                    {/* Error */}
                    {status === 'error' && (
                        <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.75rem' }}>⚠️ {errorMsg}</p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={status === 'submitting' || status === 'success'}
                        style={{
                            width: '100%', padding: '0.7rem',
                            background: status === 'success' ? '#10b981' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white', border: 'none', borderRadius: '10px',
                            fontSize: '0.9rem', fontWeight: 600,
                            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.2s',
                            opacity: status === 'submitting' ? 0.7 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            minHeight: '42px',
                        }}
                    >
                        {status === 'submitting' ? 'Submitting…'
                            : status === 'success' ? '✓ Visit Logged!'
                                : 'Submit Visit Log'}
                    </button>
                </form>
            )}
        </div>
    );
}
