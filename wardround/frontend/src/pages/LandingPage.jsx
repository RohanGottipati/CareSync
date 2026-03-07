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
            <style>{`
                .spline-wrapper,
                .spline-wrapper canvas,
                .spline-wrapper div,
                .spline-wrapper iframe,
                .spline-wrapper > * {
                    pointer-events: none !important;
                }
            `}</style>

            {/* 3D Spline Background */}
            <div
                className="spline-wrapper"
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            >
                <Spline
                    scene="https://prod.spline.design/xdWX96OncUhXEm9L/scene.splinecode"
                    style={{ pointerEvents: 'none' }}
                />
            </div>
        </div>
    );
}
