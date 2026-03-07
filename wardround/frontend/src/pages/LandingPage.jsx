import Spline from '@splinetool/react-spline';
import { useAuth0 } from '@auth0/auth0-react';

const ROLE_OPTIONS = [
    { role: 'psw', label: 'Sign Up as PSW', description: 'Personal Support Worker' },
    { role: 'family', label: 'Sign Up as Family', description: 'Family Member' },
    { role: 'coordinator', label: 'Sign Up as Coordinator', description: 'Care Coordinator' },
];

export default function LandingPage() {
    const { loginWithRedirect } = useAuth0();

    const handleSignup = (role) => {
        localStorage.setItem('signup_role', role);
        loginWithRedirect({
            authorizationParams: { screen_hint: 'signup' },
        });
    };

    const handleLogin = () => {
        loginWithRedirect();
    };

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        }}>
            {/* 3D Spline Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
            }}>
                <Spline scene="https://prod.spline.design/xdWX96OncUhXEm9L/scene.splinecode" />
            </div>

            {/* Content Overlay */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
                pointerEvents: 'none',
            }}>
                <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '0.5rem',
                        textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                    }}>
                        WardRound
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'rgba(255,255,255,0.85)',
                        marginBottom: '3rem',
                        textShadow: '0 1px 10px rgba(0,0,0,0.2)',
                    }}>
                        AI-powered care coordination
                    </p>

                    {/* Signup Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        marginBottom: '1.5rem',
                    }}>
                        {ROLE_OPTIONS.map(({ role, label, description }) => (
                            <button
                                key={role}
                                onClick={() => handleSignup(role)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    minWidth: '200px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    background: 'rgba(255,255,255,0.95)',
                                    color: '#1e3a5f',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s, box-shadow 0.15s',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
                                }}
                            >
                                <span>{label}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 400, opacity: 0.6 }}>
                                    {description}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        style={{
                            padding: '0.75rem 2.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            background: 'transparent',
                            color: 'white',
                            border: '2px solid rgba(255,255,255,0.5)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                        }}
                    >
                        Already have an account? Log In
                    </button>
                </div>
            </div>
        </div>
    );
}
