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

        </div>
    );
}
