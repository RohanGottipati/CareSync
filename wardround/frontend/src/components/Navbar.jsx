import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'For PSWs' },
  { to: '/family', label: 'For Families' },
  { to: '/coordinator', label: 'For Coordinators' },
];

export default function Navbar({ variant = 'light' }) {
  const location = useLocation();

  return (
    <header className={`${styles.navbar} ${variant === 'dark' ? styles.dark : ''}`}>
      <Link to="/" className={styles.logo}>
        CareSync
      </Link>
      <nav className={styles.nav}>
        {NAV_LINKS.map(({ to, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.actions}>
        <Link to="/dashboard" className={styles.btnSecondary}>
          Sign in
        </Link>
        <Link to="/dashboard" className={styles.btnPrimary}>
          Get started
        </Link>
      </div>
    </header>
  );
}
