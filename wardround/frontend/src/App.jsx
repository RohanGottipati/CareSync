import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppAuth } from './auth-context.jsx';
import Home from './pages/Home';
import PSWDashboard from './pages/PSWDashboard';
import FamilyPortal from './pages/FamilyPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import Navbar from './components/Navbar';

// Section 11: role-based routing — when authenticated, show view for user's role
function App() {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAppAuth();

    if (isLoading) {
        return (
            <div className="app-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Lora, serif' }}>
                Loading...
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect}><AppLayout><PSWDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/coordinator" element={<ProtectedRoute isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect}><AppLayout><CoordinatorDashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/family" element={<ProtectedRoute isAuthenticated={isAuthenticated} loginWithRedirect={loginWithRedirect}><AppLayout><FamilyPortal /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function ProtectedRoute({ isAuthenticated, loginWithRedirect, children }) {
    if (!isAuthenticated) {
        return (
            <div className="login-screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Lora, serif', background: 'var(--bg-color, #f8fafc)' }}>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>CareSync</h1>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center' }}>Secure sign-in for caregivers, families, and coordinators</p>
                <button type="button" onClick={() => loginWithRedirect()} style={{ padding: '0.75rem 1.5rem', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500, cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px' }}>Sign in with Google</button>
            </div>
        );
    }
    return children;
}

function AppLayout({ children }) {
    return (
        <>
            <Navbar variant="dark" />
            <main style={{ padding: '2rem', paddingTop: '4.5rem' }}>
                {children}
            </main>
        </>
    );
}

export default App;
