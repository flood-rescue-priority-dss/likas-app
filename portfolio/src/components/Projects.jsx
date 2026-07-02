import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

const GithubIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Web', 'Audio', 'Tools'];

  const projectsData = [
    {
      title: "Zenith Task Manager",
      category: "Web",
      description: "A fast, keyboard-shortcut-driven Kanban task manager app built using React, Vite, and HTML5 localStorage for offline capabilities.",
      tags: ["React", "CSS Grid", "LocalStorage"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "VibeCassette Synthesizer",
      category: "Audio",
      description: "Custom synthesizer engine written in native JavaScript Web Audio API, embedded within a retro lofi deck cassette wrapper.",
      tags: ["Web Audio API", "React", "Canvas"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "HookSync CLI Tool",
      category: "Tools",
      description: "A developer tool CLI that tunnels and mocks Stripe/GitHub webhook event payloads to local API routes with visual terminal reports.",
      tags: ["Node.js", "Commander", "Chalk"],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      title: "Aura UI Design Kit",
      category: "Web",
      description: "A highly-scalable minimalist design kit built as an NPM package, supporting CSS custom properties and light/dark configurations.",
      tags: ["CSS Custom Props", "Design Tokens", "React"],
      github: "https://github.com",
      live: "https://example.com"
    }
  ];

  const filteredProjects = activeFilter === 'All' 
    ? projectsData 
    : projectsData.filter(p => p.category === activeFilter);

  return (
    <section id="projects" style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px', marginBottom: '48px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px' }}>
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>
            A curated list of hand-coded applications, CLI tools, and layout systems.
          </p>
        </div>

        {/* Filter Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', padding: '6px', borderRadius: '12px' }}>
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                background: activeFilter === filter ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                border: 'none',
                color: activeFilter === filter ? 'white' : 'var(--text-secondary)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.85rem',
                transition: 'var(--transition)'
              }}
              className="filter-btn"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bento-grid" style={{ minHeight: '400px' }}>
        {filteredProjects.map((project, idx) => (
          <div 
            key={idx} 
            className="glass-card col-6" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              minHeight: '300px'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.75rem', 
                  padding: '4px 10px', 
                  borderRadius: '6px',
                  fontWeight: '500'
                }}>
                  {project.category}
                </span>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <a href={project.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'var(--transition)' }} className="project-icon-link">
                    <GithubIcon size={18} />
                  </a>
                  <a href={project.live} target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', transition: 'var(--transition)' }} className="project-icon-link">
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                {project.title}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '24px' }}>
                {project.description}
              </p>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {project.tags.map((tag, tIdx) => (
                <span 
                  key={tIdx} 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: '0.8rem', 
                    fontWeight: '400',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .project-icon-link:hover {
          color: white !important;
          transform: translateY(-1px);
        }
        .filter-btn:hover {
          color: white !important;
        }
      `}</style>
    </section>
  );
}
