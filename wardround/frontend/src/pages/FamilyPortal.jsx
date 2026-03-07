import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '../useApi';
import FamilyMessageDraft from '../components/FamilyMessageDraft';

export default function FamilyPortal() {
    const { user } = useAuth0();
    const { fetchWithAuth } = useApi();
    const firstName = user?.name?.split(' ')[0] || 'there';

    const [clients, setClients] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWithAuth('/clients')
            .then(data => {
                const list = data.clients || [];
                setClients(list);
                if (list.length === 1) setSelectedId(list[0].id);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [fetchWithAuth]);

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
                    Generate personalised update messages for each family member — reviewed by you before sending.
                </p>
            </div>

            {/* Info callout */}
            <div style={infoBox}>
                <strong>How it works:</strong> Select a client, then click <em>Generate Drafts</em>. The Family Communication Agent
                drafts two tailored messages — one for each family contact on file — based on the client's latest care history. Review and edit before sending.
            </div>

            {/* Client selector */}
            {loading && <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading…</p>}
            {error && (
                <div style={{
                    marginBottom: '1.25rem', padding: '0.75rem 1rem',
                    borderRadius: '10px', background: '#fef2f2',
                    border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.875rem',
                }}>⚠️ {error}</div>
            )}
            {!loading && clients.length === 0 && !error && (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    No clients found. Please contact your coordinator.
                </p>
            )}
            {!loading && clients.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="family-client" style={{
                        fontSize: '0.8rem', fontWeight: 600, color: '#64748b',
                        display: 'block', marginBottom: '0.4rem',
                    }}>
                        Client
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
                        {clients.length > 1 && <option value="">— select a client —</option>}
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}

            <FamilyMessageDraft clientId={selectedId} />
        </div>
    );
}
