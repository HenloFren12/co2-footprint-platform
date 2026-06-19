import { NavLink, Link } from 'react-router-dom';
import styles from './NavPill.module.css';

const NAV_ITEMS = [
  { label: 'Impact', to: '/dashboard' },
  { label: 'Journey', to: '/nudges' },
  { label: 'Forest', to: '/pacts' },
  { label: 'Insights', to: '/insights' },
  { label: 'Profile', to: '/profile' },
] as const;

export default function NavPill() {
  return (
    <nav className={styles.pill} aria-label="Main navigation">
      <Link to="/" className={styles.logo}>
        footprint.
      </Link>

      <div className={styles.links}>
        {NAV_ITEMS.map(({ label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <Link to="/nudges" className={styles.cta}>
        Track Now
      </Link>
    </nav>
  );
}
