import React from 'react';
import { Terminal, Award, Briefcase, Zap } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: <Briefcase size={20} />, label: "Years Coding", value: "5+" },
    { icon: <Award size={20} />, label: "Projects Completed", value: "30+" },
    { icon: <Terminal size={20} />, label: "GitHub Commits", value: "2K+" },
    { icon: <Zap size={20} />, label: "Success Rate", value: "99%" },
  ];

  return (
    <section id="about" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="bento-grid">
        {/* Narrative bio (Col 8) */}
        <div className="glass-card col-8" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '20px' }}>
            About <span className="gradient-text">Me</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1rem', lineHeight: '1.7' }}>
            I am a full-stack engineer and interface designer who loves building creative, accessible, and fast web experiences. I bridge the gap between clean code foundations and interactive micro-experiences.
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.7' }}>
            My work is driven by a passion for detail. Whether it is refining CSS animations, optimizing bundle sizes in React + Vite, or structuring database schemas, I believe the details matter. When I'm not coding, I'm usually experimenting with Web Audio, playing lofi beats, or designing pixel art.
          </p>
        </div>

        {/* Stats grid (Col 4) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="glass-card" 
              style={{ 
                padding: '20px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flex: 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border-color)', 
                  padding: '10px', 
                  borderRadius: '12px',
                  color: idx % 2 === 0 ? 'var(--primary)' : 'var(--secondary)'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'white' }}>{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
