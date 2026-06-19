import type { ReactNode } from 'react';
import NavPill from './NavPill';
import Footer from './Footer';
import styles from './Layout.module.css';

interface LayoutProps {
  backgroundImage: string;
  children: ReactNode;
}

export default function Layout({ backgroundImage, children }: LayoutProps) {
  return (
    <>
      {/* Full-bleed background with overlay */}
      <div
        className={styles.backdrop}
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />

      <div className={styles.wrapper}>
        <NavPill />

        <main className={styles.main}>
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}
