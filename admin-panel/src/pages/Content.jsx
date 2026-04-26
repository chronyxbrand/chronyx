import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FloppyDisk } from '@phosphor-icons/react';

const Content = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroText, setHeroText] = useState({ headline: '', subtext: '' });
  const [policies, setPolicies] = useState({ privacy: '', terms: '', shipping: '' });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      const heroData = data.find(s => s.key === 'hero_text');
      if (heroData) setHeroText(heroData.value);

      const policyData = data.find(s => s.key === 'store_policies');
      if (policyData) setPolicies(policyData.value);

    } catch (error) {
      console.error('Error fetching content:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'hero_text', value: heroText });
      
      if (error) throw error;
      alert('Hero content saved!');
    } catch (error) {
      alert('Error saving hero content');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePolicies = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'store_policies', value: policies });
      
      if (error) throw error;
      alert('Policies saved!');
    } catch (error) {
      alert('Error saving policies');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading content...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Content CMS</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* Hero Section Editor */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Homepage Hero</h3>
            <button className="btn-primary" onClick={handleSaveHero} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FloppyDisk size={16} /> Save Hero
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Main Headline</label>
              <input 
                type="text" 
                value={heroText.headline} 
                onChange={e => setHeroText({...heroText, headline: e.target.value})}
                placeholder="e.g. Precision in Every Second"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Subtext</label>
              <textarea 
                value={heroText.subtext} 
                onChange={e => setHeroText({...heroText, subtext: e.target.value})}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Policies Editor */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Store Policies</h3>
            <button className="btn-primary" onClick={handleSavePolicies} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FloppyDisk size={16} /> Save Policies
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Privacy Policy</label>
              <textarea 
                value={policies.privacy || ''} 
                onChange={e => setPolicies({...policies, privacy: e.target.value})}
                rows={5}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Terms & Conditions</label>
              <textarea 
                value={policies.terms || ''} 
                onChange={e => setPolicies({...policies, terms: e.target.value})}
                rows={5}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Shipping & Returns</label>
              <textarea 
                value={policies.shipping || ''} 
                onChange={e => setPolicies({...policies, shipping: e.target.value})}
                rows={5}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Content;
