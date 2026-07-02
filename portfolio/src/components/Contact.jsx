import React, { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [formState, setFormState] = useState('idle'); // 'idle', 'submitting', 'success', 'error'
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Name is required";
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Email format is invalid";
    }
    if (!formData.message.trim()) tempErrors.message = "Message is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // clear error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setFormState('submitting');

    // Simulate API request
    setTimeout(() => {
      setFormState('success');
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <section id="contact" style={{ padding: '80px 24px 120px', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="bento-grid">
        {/* Left Col Info (Col 5) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '20px' }}>
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem', lineHeight: '1.6' }}>
            Have a project in mind, want to collaborate, or just want to play with the widgets? Feel free to drop a message. I'll get back to you within 24 hours.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '1.5rem' }}>✉️</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Me</div>
                <a href="mailto:alex@example.com" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>alex@example.com</a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Location</div>
                <div style={{ color: 'white', fontWeight: '500' }}>San Francisco, CA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col Form (Col 7) */}
        <div className="glass-card col-8">
          {formState === 'success' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
                <Check size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '8px' }}>Message Sent!</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', fontSize: '0.95rem' }}>
                Thank you for reaching out. I will get back to you as soon as possible.
              </p>
              <button 
                onClick={() => setFormState('idle')} 
                className="btn btn-secondary" 
                style={{ marginTop: '24px', padding: '8px 20px', fontSize: '0.85rem' }}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label htmlFor="name" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>Your Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="glass-input" 
                    placeholder="John Doe"
                    disabled={formState === 'submitting'}
                  />
                  {errors.name && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <AlertCircle size={12} /> {errors.name}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '240px' }}>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>Your Email</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="glass-input" 
                    placeholder="john@example.com"
                    disabled={formState === 'submitting'}
                  />
                  {errors.email && (
                    <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                      <AlertCircle size={12} /> {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>Message</label>
                <textarea 
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5" 
                  className="glass-input" 
                  placeholder="Hey, I'd love to discuss a project..."
                  style={{ resize: 'vertical' }}
                  disabled={formState === 'submitting'}
                ></textarea>
                {errors.message && (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                    <AlertCircle size={12} /> {errors.message}
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: 'fit-content', padding: '14px 32px', justifyContent: 'center' }}
                disabled={formState === 'submitting'}
              >
                {formState === 'submitting' ? 'Sending...' : 'Send Message'}
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
