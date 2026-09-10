'use client';

import { DEMO_EDUCATION } from '@/lib/demo-data';
import { BookOpen, Volume2, Globe } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES = ['All', 'Maternal Health', 'Nutrition', 'Vaccination', 'Sanitation', 'Seasonal Health'];

export default function AshaEducation() {
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = category === 'All'
    ? DEMO_EDUCATION
    : DEMO_EDUCATION.filter(e => e.category === category);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">SwasthyaGyan</h1>
        <p className="page-subtitle">Community health education resources</p>
      </div>

      <div className="tabs">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tab ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><BookOpen /></div>
            <p className="empty-state-title">No resources available</p>
            <p className="empty-state-text">No health education content available for this category.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
          {filtered.map(item => (
            <div key={item.id} className="edu-card" onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: 'var(--space-sm)', display: 'inline-block' }}>{item.category}</span>
                  <h3 className="edu-card-title">{item.title}</h3>
                  <p className="edu-card-desc">{item.description}</p>
                </div>
              </div>

              {expandedId === item.id && (
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                  <p className="text-sm" style={{ marginBottom: 'var(--space-md)' }}>{item.content}</p>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                    {item.hasAudio && (
                      <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); speak(item.content); }}>
                        <Volume2 size={14} /> Listen
                      </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Globe size={12} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs text-muted">{item.languages.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="edu-card-meta" style={{ marginTop: 'var(--space-sm)' }}>
                {item.hasAudio && 'Audio available'} {item.languages.length > 0 && `| ${item.languages.length} languages`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
