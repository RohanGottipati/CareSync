import React, { useState, useEffect } from 'react';
import { useApi } from '../useApi';

export default function BriefingCard({ clientId }) {
    const { fetchWithAuth } = useApi();
    const [briefing, setBriefing] = useState(null);
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!clientId) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchWithAuth(`/briefings/${clientId}`)
            .then((data) => {
                if (cancelled) return;
                setBriefing(data.briefing);
                setClientName(data.clientName);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [clientId, fetchWithAuth]);

    if (!clientId) {
        return <p>Select a client to view their briefing.</p>;
    }

    if (loading) {
        return <p>Generating briefing...</p>;
    }

    if (error) {
        return (
            <div>
                <h3>Briefing Error</h3>
                <p>{error}</p>
            </div>
        );
    }

    if (!briefing) {
        return <p>No briefing available.</p>;
    }

    return (
        <div>
            <h3>Pre-Visit Briefing — {clientName}</h3>
            <p>{briefing}</p>
        </div>
    );
}
