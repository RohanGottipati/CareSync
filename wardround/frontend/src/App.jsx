import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import PSWDashboard from './pages/PSWDashboard';
import FamilyPortal from './pages/FamilyPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import LandingPage from './pages/LandingPage';

const ROLES_CLAIM = 'https://wardround.app/roles';

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
    const { isAuthenticated, isLoading, user, logout, error } = useAuth0();

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

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#64748b',
            }}>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LandingPage />;
    }

    const role = getUserRole(user);

    if (!role) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>No Role Assigned</h2>
                <p>Your account does not have a role assigned. Please contact your administrator.</p>
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
                        fontSize: '1rem',
                    }}
                >
                    Log Out
                </button>
            </div>
        );
    }

    const navLinks = [];
    if (role === 'psw' || role === 'coordinator') {
        navLinks.push({ to: '/', label: 'PSW Dashboard' });
    }
    if (role === 'coordinator') {
        navLinks.push({ to: '/coordinator', label: 'Coordinator' });
    }
    if (role === 'family' || role === 'coordinator') {
        navLinks.push({ to: '/family', label: 'Family Portal' });
    }

    return (
        <BrowserRouter>
            <nav style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <ul style={{ display: 'flex', gap: '1.25rem', listStyle: 'none', margin: 0, padding: 0 }}>
                    {navLinks.map(({ to, label }) => (
                        <li key={to}>
                            <Link to={to} style={{ color: 'white', textDecoration: 'none', fontWeight: 500 }}>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                        {user?.name || user?.email} ({role})
                    </span>
                    <button
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                        style={{
                            padding: '0.4rem 1rem',
                            background: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </nav>
            <main style={{ padding: '2rem' }}>
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
            </main>
        </BrowserRouter>
    );
}

function App() {
    return <AppContent />;
}

export default App;
