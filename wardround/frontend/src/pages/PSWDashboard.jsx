import React from 'react';
import BriefingCard from '../components/BriefingCard';
import VisitLogger from '../components/VisitLogger';
import DocumentUpload from '../components/DocumentUpload';

export default function PSWDashboard() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ margin: 0 }}>PSW Dashboard</h1>
            <BriefingCard />
            <VisitLogger />
            <DocumentUpload />
        </div>
    );
}
