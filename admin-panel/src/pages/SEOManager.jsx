import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash, FloppyDisk } from '@phosphor-icons/react';

export default function SEOManager() {
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverrides();
  }, []);

  const fetchOverrides = async () => {
    setLoading(true);
    const { data } = await supabase.from('seo_overrides').select('*').order('path');
    if (data) setOverrides(data);
    setLoading(false);
  };

  const updateOverride = (id, field, value) => {
    setOverrides(curr => curr.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const saveOverride = async (override) => {
    if (!override.path) return alert("Path is required");
    
    // Ensure path starts with /
    let safePath = override.path.trim();
    if (!safePath.startsWith('/')) safePath = '/' + safePath;

    const { error } = await supabase.from('seo_overrides').upsert({
      id: override.id.startsWith('new-') ? undefined : override.id,
      path: safePath,
      title: override.title,
      description: override.description,
      image: override.image,
      updated_at: new Date()
    });
    if (error) alert("Error saving: " + error.message);
    else {
      alert("Override saved successfully.");
      fetchOverrides();
    }
  };

  const addOverride = () => {
    setOverrides([{ id: 'new-' + Date.now(), path: '/', title: '', description: '', image: '' }, ...overrides]);
  };

  const deleteOverride = async (id) => {
    if (id.startsWith('new-')) {
      setOverrides(curr => curr.filter(o => o.id !== id));
      return;
    }
    const confirmed = window.confirm("Delete this SEO override?");
    if (!confirmed) return;
    
    const { error } = await supabase.from('seo_overrides').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchOverrides();
  };

  if (loading) return <div>Loading SEO overrides...</div>;

  return (
    <div className="marketing-page">
      <div className="page-header">
        <div>
          <h2>SEO Overrides</h2>
          <p className="cms-page-subtitle">Inject custom Meta Titles and Descriptions for specific URL paths without touching code. E.g. `/shop`</p>
        </div>
        <button className="btn-primary marketing-action-btn" onClick={addOverride}>
          <Plus size={16} /> New Override
        </button>
      </div>
      
      <div className="marketing-table-wrap">
        <table className="marketing-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>URL Path</th>
              <th style={{ width: '30%' }}>SEO Title</th>
              <th style={{ width: '40%' }}>SEO Description</th>
              <th style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {overrides.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  No overrides configured. Please run `create_seo_overrides.sql` in Supabase if saving fails.
                </td>
              </tr>
            ) : null}
            {overrides.map(o => (
              <tr key={o.id}>
                <td>
                  <input type="text" className="settings-input" value={o.path} onChange={e => updateOverride(o.id, 'path', e.target.value)} placeholder="/example-path" style={{width: '100%', padding: '8px'}} />
                </td>
                <td>
                  <input type="text" className="settings-input" value={o.title || ''} onChange={e => updateOverride(o.id, 'title', e.target.value)} placeholder="Custom Title" style={{width: '100%', padding: '8px'}} />
                </td>
                <td>
                  <textarea className="settings-input" value={o.description || ''} onChange={e => updateOverride(o.id, 'description', e.target.value)} rows={2} style={{width: '100%', padding: '8px'}} />
                </td>
                <td>
                  <div className="marketing-row-actions">
                    <button className="btn-secondary marketing-mini-btn" onClick={() => saveOverride(o)}><FloppyDisk size={16} /></button>
                    <button className="btn-secondary marketing-mini-btn" onClick={() => deleteOverride(o.id)}><Trash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
