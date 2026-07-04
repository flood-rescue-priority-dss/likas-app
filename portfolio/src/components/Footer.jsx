import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '40px 24px',
      background: 'rgba(11, 12, 16, 0.5)',
      backdropFilter: 'blur(10px)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <div>
          &copy; {new Date().getFullYear()} Alex. Built from scratch with React & Vite.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Crafted with</span>
          <Heart size={14} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
          <span>&amp; clean code.</span>
        </div>
      </div>
    </footer>
  );
}
