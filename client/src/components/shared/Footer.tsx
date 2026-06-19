import styles from './Footer.module.css';

const FOOTER_LINKS = ['Privacy', 'Terms', 'Earth Data'] as const;

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.logo}>footprint.</span>

      <span className={styles.copyright}>
        © 2026 footprint. Stewardship through intention.
      </span>

      <div className={styles.links}>
        {FOOTER_LINKS.map((label) => (
          <a
            key={label}
            href="#"
            className={styles.link}
            aria-label={label}
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
}
