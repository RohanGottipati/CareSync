import React, { useState, useEffect } from 'react';
import { useApi } from '../useApi';
import BriefingCard from '../components/BriefingCard';
import VisitLogger from '../components/VisitLogger';

export default function PSWDashboard() {
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
            <h1 style={{ marginBottom: '1.5rem' }}>PSW Dashboard</h1>

            {/* Client selector (shown when multiple clients) */}
            {!loadingClients && clients.length > 1 && (
                <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="client-select" style={{
                        fontWeight: 600, fontSize: '0.85rem', color: '#64748b',
                        display: 'block', marginBottom: '0.4rem',
                    }}>
                        Select Client
                    </label>
                    <select
                        id="client-select"
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

            <BriefingCard clientId={selectedId} />
            <VisitLogger clientId={selectedId} />
        </div>
    );
}
