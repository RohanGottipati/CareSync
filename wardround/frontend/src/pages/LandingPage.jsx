import React from 'react';
import Spline from '@splinetool/react-spline';

/** Catches Spline load errors (e.g. Invalid URI / media resource failed) so the page still renders. */
class SplineErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
                }} />
            );
        }
        return this.props.children;
    }
}

export default function LandingPage() {
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
                <SplineErrorBoundary>
                    <Spline scene="https://prod.spline.design/xdWX96OncUhXEm9L/scene.splinecode" />
                </SplineErrorBoundary>
            </div>

            {/* Foreground Content */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                color: 'white',
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dim to make text readable over 3D model
                pointerEvents: 'none', // Allow clicking the 3D model if wanted
            }}>
                <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                </div>
            </div>
        </div>
    );
}
