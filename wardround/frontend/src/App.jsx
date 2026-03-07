import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PSWDashboard from './pages/PSWDashboard';
import FamilyPortal from './pages/FamilyPortal';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

function App() {
    return (
        <BrowserRouter>
            <nav style={{ padding: '1rem', background: 'var(--primary)', color: 'white' }}>
                <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none', margin: 0, padding: 0 }}>
                    <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>PSW Dashboard</Link></li>
                    <li><Link to="/coordinator" style={{ color: 'white', textDecoration: 'none' }}>Coordinator</Link></li>
                    <li><Link to="/family" style={{ color: 'white', textDecoration: 'none' }}>Family Portal</Link></li>
                </ul>
            </nav>
            <main style={{ padding: '2rem' }}>
                <Routes>
                    <Route path="/" element={<PSWDashboard />} />
                    <Route path="/coordinator" element={<CoordinatorDashboard />} />
                    <Route path="/family" element={<FamilyPortal />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;
