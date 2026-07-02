import React from 'react';
import { Monitor, Smartphone, Zap } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: <Monitor size={24} />,
      title: "Web Development",
      description: "Building responsive, robust single-page applications using modern frameworks like React and Vite with optimized performance."
    },
    {
      icon: <Smartphone size={24} />,
      title: "Interface & UX Design",
      description: "Designing user flows, component architectures, and prototyping sleek minimalist dark interfaces centered around simplicity."
    },
    {
      icon: <Zap size={24} />,
      title: "Performance Optimization",
      description: "Optimizing bundle sizes, audit reports, asset loading speeds, and rendering structures to guarantee fast load times."
    }
  ];

  return (
    <section id="services" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px' }}>
          Services I <span className="gradient-text">Offer</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Providing high-quality design and development services to bring your visual ideas to the screen.
        </p>
      </div>

      <div className="bento-grid">
        {services.map((service, idx) => (
          <div 
            key={idx} 
            className="glass-card col-4" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              padding: '40px 32px'
            }}
          >
            <div style={{ 
              background: idx === 1 ? 'var(--secondary-glow)' : 'var(--primary-glow)', 
              color: idx === 1 ? 'var(--secondary)' : 'var(--primary)', 
              padding: '16px', 
              borderRadius: '16px',
              width: 'fit-content',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {service.icon}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'white', marginTop: '8px' }}>
              {service.title}
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
