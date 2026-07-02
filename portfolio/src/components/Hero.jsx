import React from 'react';
import { ArrowRight, Code2, Sparkles, Terminal } from 'lucide-react';

export default function Hero() {
  return (
    <section id="hero" style={{
      position: 'relative',
      padding: '160px 24px 80px',
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      overflow: 'hidden'
    }}>
      {/* Subtle clean background patterns */}
      <div className="bg-grid-pattern"></div>
      <div className="bg-radial-gradient"></div>

      <div style={{ maxWidth: '800px', zIndex: 2 }}>
        {/* Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          borderRadius: '50px',
          padding: '6px 16px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '24px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', display: 'inline-block' }}></span>
          Available for new opportunities
        </div>

        {/* Main Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '24px'
        }}>
          Building clean, interactive & <br />
          <span className="gradient-text">meaningful web experiences</span>
        </h1>

        {/* Supporting Copy */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 40px',
          fontWeight: '300'
        }}>
          Hi, I'm Alex. A creative developer specializing in building modern web apps with React, clean code, and playful interactive elements.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          <a href="#projects" className="btn btn-primary">
            Explore Projects
            <ArrowRight size={18} />
          </a>
          <a href="#contact" className="btn btn-secondary">
            Get in touch
          </a>
        </div>
      </div>

      {/* Floating Minimalist Cards (Showcasing design/dev details) */}
      <div className="floating-cards-container" style={{
        display: 'flex',
        gap: '24px',
        width: '100%',
        maxWidth: '900px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        zIndex: 2
      }}>
        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flex: '1', minWidth: '240px', maxWidth: '300px' }}>
          <div style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
            <Code2 size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Core Stack</div>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>React & Node.js</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flex: '1', minWidth: '240px', maxWidth: '300px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--secondary)', padding: '12px', borderRadius: '12px' }}>
            <Terminal size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clean Architecture</div>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>Performance-First</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flex: '1', minWidth: '240px', maxWidth: '300px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#fff', padding: '12px', borderRadius: '12px' }}>
            <Sparkles size={22} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>UX Philosophy</div>
            <div style={{ fontWeight: '600', fontSize: '1rem' }}>Playful Minimalism</div>
          </div>
        </div>
      </div>
    </section>
  );
}
