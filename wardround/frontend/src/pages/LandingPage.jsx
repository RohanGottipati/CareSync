import React from 'react';
import Spline from '@splinetool/react-spline';

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
                <Spline scene="https://prod.spline.design/xdWX96OncUhXEm9L/scene.splinecode" />
            </div>

            {/* Top Navigation Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                boxSizing: 'border-box',
                zIndex: 10,
                padding: '1.5rem 4rem', // Increased right padding to pull it away from the edge
                display: 'flex',
                justifyContent: 'flex-end',
                pointerEvents: 'none',
            }}>
                <button
                    onClick={() => { window.location.href = '/login'; }}
                    style={{
                        pointerEvents: 'auto',
                        padding: '0.6rem 2rem',
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: 'white',
                        color: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
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
                    Log In
                </button>
            </div>
        </div>
    );
}
