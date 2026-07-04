import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`glass-navbar ${scrolled ? 'scrolled' : ''}`}>
        <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white', fontWeight: '700', fontSize: '1.2rem' }}>
          <Sparkles size={20} className="gradient-text" style={{ color: 'var(--primary)' }} />
          <span>Alex<span className="gradient-text">.dev</span></span>
        </a>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="desktop-only">
          <a href="#about" className="nav-link">About</a>
          <a href="#widgets" className="nav-link">Playground</a>
          <a href="#skills" className="nav-link">Skills</a>
          <a href="#projects" className="nav-link">Work</a>
          <a href="#contact" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Let's Talk</a>
        </nav>

        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'none' }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '96px',
          left: '24px',
          right: '24px',
          background: 'rgba(11, 12, 16, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 999,
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1.1rem', padding: '8px 0' }}>About</a>
          <a href="#widgets" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1.1rem', padding: '8px 0' }}>Playground</a>
          <a href="#skills" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1.1rem', padding: '8px 0' }}>Skills</a>
          <a href="#projects" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', fontSize: '1.1rem', padding: '8px 0' }}>Work</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ textAlign: 'center', justifyContent: 'center' }}>Let's Talk</a>
        </div>
      )}

      <style>{`
        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: var(--transition);
        }
        .nav-link:hover {
          color: white;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
