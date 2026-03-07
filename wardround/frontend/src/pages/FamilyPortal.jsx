import React, { useState, useEffect } from 'react';
import { useApi } from '../useApi';
import FamilyMessageDraft from '../components/FamilyMessageDraft';

export default function FamilyPortal() {
    const { fetchWithAuth } = useApi();
    const [clients, setClients] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loadingClients, setLoadingClients] = useState(true);

    useEffect(() => {
        fetchWithAuth('/clients')
            .then((data) => {
                const list = data.clients || [];
                setClients(list);
                if (list.length === 1) setSelectedId(list[0].id);
            })
            .catch(() => { })
            .finally(() => setLoadingClients(false));
    }, [fetchWithAuth]);

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Family Portal</h1>

            {/* Client selector */}
            {!loadingClients && clients.length > 1 && (
                <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="family-client-select" style={{
                        fontWeight: 600, fontSize: '0.85rem', color: '#64748b',
                        display: 'block', marginBottom: '0.4rem',
                    }}>
                        Select Client
                    </label>
                    <select
                        id="family-client-select"
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        style={{
                            padding: '0.5rem 0.85rem',
                            border: '1px solid var(--border)', borderRadius: '8px',
                            fontSize: '0.9rem', background: 'white',
                            color: 'var(--text-main)', cursor: 'pointer', minWidth: '220px',
                        }}
                    >
                        <option value="">— choose a client —</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            )}

            {!loadingClients && clients.length === 0 && (
                <p style={{ color: '#94a3b8' }}>No clients found. A coordinator must create client records first.</p>
            )}

            <FamilyMessageDraft clientId={selectedId} />
        </div>
    );
}
