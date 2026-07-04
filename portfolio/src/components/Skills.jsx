import React from 'react';
import { Layout, Server, Settings, Heart } from 'lucide-react';

export default function Skills() {
  const skillCategories = [
    {
      title: "Frontend Stack",
      icon: <Layout size={20} style={{ color: 'var(--primary)' }} />,
      skills: ["React", "JavaScript", "HTML5/CSS3", "Vite", "Tailwind CSS"]
    },
    {
      title: "Backend & Systems",
      icon: <Server size={20} style={{ color: 'var(--secondary)' }} />,
      skills: ["Node.js", "Express", "RESTful APIs", "PostgreSQL", "MongoDB"]
    },
    {
      title: "Tools & Extras",
      icon: <Settings size={20} style={{ color: '#10b981' }} />,
      skills: ["Git / GitHub", "Figma", "Web Audio API", "UX / UI Design", "Responsive Layouts"]
    }
  ];

  return (
    <section id="skills" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px' }}>
          My <span className="gradient-text">Skills</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          A checklist of technologies I use to turn ideas into fully-functional websites.
        </p>
      </div>

      <div className="bento-grid">
        {skillCategories.map((category, idx) => (
          <div key={idx} className="glass-card col-4" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--border-color)', 
                padding: '10px', 
                borderRadius: '12px'
              }}>
                {category.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{category.title}</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
              {category.skills.map((skill, sIdx) => (
                <div 
                  key={sIdx} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)'
                  }}
                  className="skill-badge"
                >
                  <span>{skill}</span>
                  <Heart size={12} className="heart-icon" style={{ opacity: 0.1, color: 'var(--primary)', transition: 'var(--transition)' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .skill-badge:hover {
          background: rgba(255, 255, 255, 0.03) !important;
          border-color: var(--border-hover) !important;
          padding-left: 20px !important;
        }
        .skill-badge:hover .heart-icon {
          opacity: 1 !important;
          transform: scale(1.2);
        }
      `}</style>
    </section>
  );
}
