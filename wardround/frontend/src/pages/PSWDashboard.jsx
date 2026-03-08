import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useApi } from '../useApi';
import BriefingCard from '../components/BriefingCard';
import VisitLogger from '../components/VisitLogger';

const ROLES_CLAIM = 'https://wardround.app/roles';

export default function PSWDashboard() {
    const { user } = useAuth0();
    const { fetchWithAuth } = useApi();
    const roles = user?.[ROLES_CLAIM] || [];
    const isCoordinator = roles.includes('coordinator');

    const [clients, setClients] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [loadingClients, setLoadingClients] = useState(true);
    const [clientsError, setClientsError] = useState('');

    useEffect(() => {
        const endpoint = isCoordinator ? '/clients' : '/clients/my-clients';
        fetchWithAuth(endpoint)
            .then(data => {
                const list = data.clients || [];
                setClients(list);
                if (list.length === 1) setSelectedId(clientIdFrom(list[0]));
            })
            .catch(err => setClientsError(err.message))
            .finally(() => setLoadingClients(false));
    }, [fetchWithAuth, isCoordinator]);

    const clientIdFrom = (c) => (isCoordinator ? c.id : c.client_id);
    const selectedClient = clients.find(c => clientIdFrom(c) === selectedId);
    const firstName = user?.name?.split(' ')[0] || 'there';

    /* ── styles ─── */
    const page = { maxWidth: '720px', margin: '0 auto' };
    const header = {
        marginBottom: '1.75rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid #e2e8f0',
    };
    const roleChip = {
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        padding: '0.2rem 0.7rem', borderRadius: '9999px',
        background: '#dbeafe', color: '#1d4ed8',
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    };
    const selectorLabel = {
        fontSize: '0.8rem', fontWeight: 600, color: '#64748b',
        display: 'block', marginBottom: '0.4rem',
    };
    const selectorBox = {
        padding: '0.55rem 0.85rem',
        border: '1px solid #e2e8f0', borderRadius: '10px',
        fontSize: '0.9rem', background: 'white', color: '#0f172a',
        cursor: 'pointer', minWidth: '240px',
        boxShadow: '0 1px 2px rgba(0,0,0,.04)',
    };

    return (
        <div style={page}>
            {/* Page header */}
            <div style={header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                        Good {hour()}, {firstName}
                    </h1>
                    <span style={roleChip}>PSW</span>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    Select a client to load their pre-visit briefing and log today's visit.
                </p>
            </div>

            {/* Client selector */}
            {loadingClients && (
                <div style={{ marginBottom: '1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Loading your clients…
                </div>
            )}
            {clientsError && (
                <div style={{
                    marginBottom: '1.25rem', padding: '0.75rem 1rem',
                    borderRadius: '10px', background: '#fef2f2',
                    border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.875rem',
                }}>
                    ⚠️ {clientsError}
                </div>
            )}
            {!loadingClients && clients.length === 0 && !clientsError && (
                <div style={{
                    marginBottom: '1.25rem', padding: '1rem 1.25rem',
                    borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0',
                    fontSize: '0.875rem', color: '#64748b',
                }}>
                    You have no current or upcoming client assignments. Contact your coordinator.
                </div>
            )}
            {!loadingClients && clients.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="psw-client-select" style={selectorLabel}>
                        Client
                    </label>
                    <select
                        id="psw-client-select"
                        value={selectedId}
                        onChange={e => setSelectedId(e.target.value)}
                        style={selectorBox}
                    >
                        {clients.length > 1 && <option value="">— select a client —</option>}
                        {clients.map(c => (
                            <option key={c.id} value={clientIdFrom(c)}>
                                {isCoordinator ? (c.name || c.client_name) : clientLabel(c)}
                            </option>
                        ))}
                    </select>
                    {selectedClient?.conditions && (
                        <div style={{
                            display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap',
                            marginTop: '0.5rem',
                        }}>
                            {selectedClient.conditions.split(',').map(cond => cond.trim()).filter(Boolean).map(cond => (
                                <span key={cond} style={{
                                    padding: '0.15rem 0.55rem', borderRadius: '9999px',
                                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                                    fontSize: '0.72rem', color: '#475569',
                                }}>{cond}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Main content */}
            <BriefingCard clientId={selectedId} />
            <VisitLogger clientId={selectedId} />
        </div>
    );
}

function hour() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
}

const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const shiftOpts = { timeZone: localTz, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
const timeOpts = { timeZone: localTz, hour: '2-digit', minute: '2-digit' };

function clientLabel(c) {
    const name = c.client_name || c.name || 'Client';
    if (c.is_active_now) return `${name} — Current shift`;
    if (c.shift_start) {
        const start = new Date(c.shift_start);
        const end = c.shift_end ? new Date(c.shift_end) : null;
        const range = end
            ? start.toLocaleString('en-CA', shiftOpts) + ' – ' + end.toLocaleTimeString('en-CA', timeOpts)
            : start.toLocaleString('en-CA', shiftOpts);
        return `${name} — Upcoming: ${range}`;
    }
    return name;
}
