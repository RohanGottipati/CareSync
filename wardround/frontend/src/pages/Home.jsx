import { useRef, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import CardNav from '../components/CardNav';
import styles from './Home.module.css';

const homeNavItems = [
  {
    label: 'PSW Workers',
    bgColor: '#0f172a',
    textColor: '#e2e8f0',
    links: [
      { label: 'Dashboard', href: '/dashboard', ariaLabel: 'View dashboard' },
      { label: 'Pre-visit briefings', href: '/dashboard', ariaLabel: 'Briefings' },
      { label: 'Log a visit', href: '/dashboard', ariaLabel: 'Log visit' },
    ],
  },
  {
    label: 'Family Members',
    bgColor: '#164e63',
    textColor: '#e2e8f0',
    links: [
      { label: 'Family portal', href: '/family', ariaLabel: 'Family portal' },
      { label: 'Care summaries', href: '/family', ariaLabel: 'Summaries' },
      { label: 'Updates', href: '/family', ariaLabel: 'Updates' },
    ],
  },
  {
    label: 'Coordinators',
    bgColor: '#312e81',
    textColor: '#e2e8f0',
    links: [
      { label: 'Coordinator dashboard', href: '/coordinator', ariaLabel: 'Coordinator dashboard' },
      { label: 'All clients', href: '/coordinator', ariaLabel: 'All clients' },
      { label: 'Medication flags', href: '/coordinator', ariaLabel: 'Flags' },
    ],
  },
];

// Hide "Built with Spline" if the runtime injects it into the DOM (e.g. a link).
// If the watermark is drawn on the canvas, it can't be removed without Spline Super or editing the .splinecode file.
function useHideSplineBranding(wrapperRef) {
  useEffect(() => {
    const el = wrapperRef?.current;
    if (!el) return;
    const hide = () => {
      el.querySelectorAll('a[href*="spline"], a[href*="spline.design"], [class*="watermark"], [class*="branding"]').forEach((node) => {
        node.style.setProperty('display', 'none', 'important');
        node.style.setProperty('visibility', 'hidden', 'important');
      });
    };
    hide();
    const obs = new MutationObserver(hide);
    obs.observe(el, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [wrapperRef]);
}

// Map Spline object names (from your scene) to app routes.
// In Spline: select an object → check the name in the hierarchy.
// Add entries here so clicking that object navigates to the route.
const SPLINE_OBJECT_TO_ROUTE = {
  Home: '/',
  Dashboard: '/dashboard',
  'PSW Dashboard': '/dashboard',
  Coordinator: '/coordinator',
  'Family Portal': '/family',
  Family: '/family',
};

export default function Home() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  useHideSplineBranding(wrapperRef);

  const handleSplineMouseDown = useCallback(
    (e) => {
      const name = e?.target?.name;
      if (!name) return;
      // In dev: log so you can add this name to SPLINE_OBJECT_TO_ROUTE if needed
      if (import.meta.env.DEV) {
        console.log('[Spline] Clicked object name:', name);
      }
      // Exact match
      const route = SPLINE_OBJECT_TO_ROUTE[name];
      if (route !== undefined) {
        navigate(route);
        return;
      }
      // Partial match (e.g. "Button - Dashboard" → Dashboard)
      for (const [key, path] of Object.entries(SPLINE_OBJECT_TO_ROUTE)) {
        if (name.includes(key)) {
          navigate(path);
          return;
        }
      }
    },
    [navigate]
  );

  return (
    <>
      <CardNav
        logoText="CareSync"
        logoHref="/"
        items={homeNavItems}
        baseColor="rgba(255, 255, 255, 0.1)"
        menuColor="#fff"
        buttonBgColor="#a5f3fc"
        buttonTextColor="#0f172a"
        buttonText="Log in"
        buttonHref="/dashboard"
        hideOnScroll
        actions={
          <>
            <Link to="/dashboard" className="card-nav-cta-button" style={{ backgroundColor: '#a5f3fc', color: '#0f172a' }}>
              Log in
            </Link>
          </>
        }
      />
      <main className={styles.main}>
        <div ref={wrapperRef} className={styles.splineWrapper}>
          <Spline
            scene="https://prod.spline.design/wHXpw7xhHFaOmE8X/scene.splinecode"
            className={styles.spline}
            onSplineMouseDown={handleSplineMouseDown}
          />
        </div>
        <div className={styles.splineLogoCover} aria-hidden />
        {/* Covers "Contact Us" text in lower middle; colour-matched to background */}
        <div className={styles.contactUsCover} aria-hidden />
        {/* Quick summary to the left of the 3D cube */}
        <div className={styles.cubeSummary}>
          <p className={styles.cubeSummaryText}>
            CareSync keeps caregivers, families, and coordinators in sync—with instant briefings, nightly medication checks, and tailored family updates from one shared memory.
          </p>
        </div>
      </main>
    </>
  );
}
