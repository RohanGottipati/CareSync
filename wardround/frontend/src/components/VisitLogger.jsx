import React from 'react';

export default function VisitLogger() {
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <h2>Log Visit</h2>
            <textarea placeholder="Enter visit details..." style={{ width: '100%', minHeight: '100px' }} />
            <button style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px' }}>Submit</button>
        </div>
    );
}
