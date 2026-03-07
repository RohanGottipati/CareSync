import { useAuth0 } from '@auth0/auth0-react';

export default function LandingPage() {
    const { loginWithRedirect } = useAuth0();

    const loginWithGoogle = () => {
        loginWithRedirect({
            authorizationParams: {
                connection: 'google-oauth2',
            },
        });
    };

    const loginWithEmail = () => {
        loginWithRedirect();
    };

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

            {/* Primary: Google Login */}
            <button
                id="google-login-btn"
                onClick={loginWithGoogle}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 2.5rem',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'white',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    marginBottom: '1rem',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
                }}
            >
                {/* Google "G" icon */}
                <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Sign in with Google
            </button>

            {/* Secondary: Email/Password fallback */}
            <button
                id="email-login-btn"
                onClick={loginWithEmail}
                style={{
                    padding: '0.6rem 2rem',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                }}
            >
                Sign in with email
            </button>

            <p style={{ marginTop: '2rem', fontSize: '0.8rem', opacity: 0.5 }}>
                Secure sign-in · Canadian data residency · Auth0
            </p>
        </div>
    );
}
