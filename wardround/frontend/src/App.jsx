import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Home, Users, LayoutDashboard, LogIn } from 'lucide-react';
import PSWDashboard from './pages/PSWDashboard';
import FamilyPortal from './pages/FamilyPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import LandingPage from './pages/LandingPage';
import AboutPSW from './pages/AboutPSW';
import AboutFamily from './pages/AboutFamily';
import AboutCoordinator from './pages/AboutCoordinator';
import { NavBar } from './components/NavBar';

const ROLES_CLAIM = 'https://wardround.app/roles';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function getUserRole(user) {
    const roles = user?.[ROLES_CLAIM] || [];
    if (roles.includes('coordinator')) return 'coordinator';
    if (roles.includes('psw')) return 'psw';
    if (roles.includes('family')) return 'family';
    return null;
}

const ROLE_CONFIG = {
    psw: { defaultPath: '/', allowedPaths: ['/', '/psw'] },
    family: { defaultPath: '/family', allowedPaths: ['/family'] },
    coordinator: { defaultPath: '/coordinator', allowedPaths: ['/', '/psw', '/coordinator', '/family'] },
};

function ProtectedRoute({ role, allowedRoles, children }) {
    if (!role || !allowedRoles.includes(role)) {
        const config = ROLE_CONFIG[role];
        return <Navigate to={config?.defaultPath || '/'} replace />;
    }
    return children;
}

function AppContent() {
    const { isAuthenticated, isLoading, user, logout, loginWithRedirect, error, getAccessTokenSilently } = useAuth0();
    const [assigningRole, setAssigningRole] = useState(false);
    const [assignError, setAssignError] = useState(null);
    const [assignedRole, setAssignedRole] = useState(null);

    const assignRole = useCallback(async () => {
        const pendingRole = localStorage.getItem('signup_role');
        if (!pendingRole) return;

        setAssigningRole(true);
        setAssignError(null);

        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${API_URL}/api/assign-role`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: pendingRole }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || `Failed to assign role (${res.status})`);
            }

            localStorage.removeItem('signup_role');
            setAssignedRole(pendingRole);

            await getAccessTokenSilently({ cacheMode: 'off' });

            window.location.reload();
        } catch (err) {
            console.error('Role assignment failed:', err);
            setAssignError(err.message);
            localStorage.removeItem('signup_role');
        } finally {
            setAssigningRole(false);
        }
    }, [getAccessTokenSilently]);

    useEffect(() => {
        if (isAuthenticated && !isLoading && !getUserRole(user)) {
            const pendingRole = localStorage.getItem('signup_role');
            if (pendingRole) {
                assignRole();
            }
        }
    }, [isAuthenticated, isLoading, user, assignRole]);

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Authentication Error</h2>
                <p style={{ color: '#ef4444' }}>{error.message}</p>
                <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (isLoading || assigningRole) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#64748b',
                gap: '0.5rem',
            }}>
                <span>{assigningRole ? 'Setting up your account...' : 'Loading...'}</span>
            </div>
        );
    }

    const role = assignedRole || getUserRole(user);

    const navItems = [];
    if (!isAuthenticated) {
        navItems.push({ url: '/', name: 'Home', icon: Home });
        navItems.push({ url: '/psw', name: 'Psw', icon: LayoutDashboard });
        navItems.push({ url: '/family', name: 'Family', icon: Home });
        navItems.push({ url: '/coordinator', name: 'Coordinators', icon: Users });
        navItems.push({
            name: 'Log In',
            icon: LogIn,
            action: () => loginWithRedirect()
        });
    } else {
        if (role === 'psw' || role === 'coordinator') {
            navItems.push({ url: '/', name: 'PSW Dashboard', icon: LayoutDashboard });
        }
        if (role === 'coordinator') {
            navItems.push({ url: '/coordinator', name: 'Coordinator', icon: Users });
        }
        if (role === 'family' || role === 'coordinator') {
            navItems.push({ url: '/family', name: 'Family Portal', icon: Home });
        }
    }

    return (
        <BrowserRouter>
            {isAuthenticated && role && (
                <div style={{
                    position: 'fixed',
                    top: '1rem',
                    right: '1.5rem',
                    zIndex: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)', opacity: 0.85 }}>
                        {user?.name || user?.email} ({role})
                    </span>
                    <button
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                        style={{
                            padding: '0.4rem 1rem',
                            background: 'white',
                            color: '#ef4444',
                            border: '1px solid #fee2e2',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'white';
                        }}
                    >
                        Log Out
                    </button>
                </div>
            )}

            <NavBar items={navItems} />

            <main style={isAuthenticated ? { padding: '2rem', paddingTop: '6rem' } : { padding: 0 }}>
                {!isAuthenticated ? (
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/psw" element={<AboutPSW />} />
                        <Route path="/family" element={<AboutFamily />} />
                        <Route path="/coordinator" element={<AboutCoordinator />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                ) : assignError ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Role Assignment Failed</h2>
                        <p style={{ color: '#ef4444', marginBottom: '2rem' }}>{assignError}</p>
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            style={{
                                padding: '0.6rem 2rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                            }}
                        >
                            Log Out and Try Again
                        </button>
                    </div>
                ) : !role ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Role Assigned</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                            Your account does not have a role assigned. Please log out and sign up using one of the role buttons.
                        </p>
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            style={{
                                padding: '0.6rem 2rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute role={role} allowedRoles={['psw', 'coordinator']}>
                                    <PSWDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/coordinator"
                            element={
                                <ProtectedRoute role={role} allowedRoles={['coordinator']}>
                                    <CoordinatorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/family"
                            element={
                                <ProtectedRoute role={role} allowedRoles={['family', 'coordinator']}>
                                    <FamilyPortal />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="*"
                            element={<Navigate to={ROLE_CONFIG[role]?.defaultPath || '/'} replace />}
                        />
                    </Routes>
                )}
            </main>
        </BrowserRouter>
    );
}

function App() {
    return <AppContent />;
}

export default App;
