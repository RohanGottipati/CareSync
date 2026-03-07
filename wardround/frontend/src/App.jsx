import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Home, Users, LayoutDashboard, LogIn } from 'lucide-react';
import PSWDashboard from './pages/PSWDashboard';
import FamilyPortal from './pages/FamilyPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import LandingPage from './pages/LandingPage';
import { NavBar } from './components/NavBar';

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
    const { isAuthenticated, isLoading, user, logout, loginWithRedirect, error } = useAuth0();

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

    // Determine Role
    const role = getUserRole(user);

    // Build Nav Items based on authentication
    const navItems = [];
    if (!isAuthenticated) {
        // Public Nav Items
        navItems.push({
            name: 'Log In',
            icon: LogIn,
            action: () => loginWithRedirect()
        });
    } else {
        // Authenticated Nav Items
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
            {/* User Info & Logout Button - Fixed Top Right (Only show if authenticated and has role) */}
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

            {/* The Animated Navigation Bar - Rendered for EVERYONE */}
            <NavBar items={navItems} />

            <main style={isAuthenticated ? { padding: '2rem', paddingTop: '6rem' } : { padding: 0 }}>
                {/* Router Body */}
                {!isAuthenticated ? (
                    <LandingPage />
                ) : !role ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Role Assigned</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                            Your account does not have a role assigned. Please contact your administrator or update your Auth0 settings to assign the 'coordinator', 'psw', or 'family' role.
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
