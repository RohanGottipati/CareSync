import { useAuth0 } from '@auth0/auth0-react';

export default function LandingPage() {
    const { loginWithRedirect } = useAuth0();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '2rem',
        }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                WardRound
            </h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.85, maxWidth: '500px', marginBottom: '2.5rem' }}>
                AI-powered care coordination for PSWs, families, and coordinators.
            </p>
            <button
                onClick={() => loginWithRedirect()}
                style={{
                    padding: '0.875rem 2.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'white',
                    color: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                }}
                onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
                }}
            >
                Log In
            </button>
        </div>
    );
}
