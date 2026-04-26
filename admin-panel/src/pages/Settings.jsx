import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FloppyDisk } from '@phosphor-icons/react';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    cod_enabled: true,
    cod_fee: 100,
    free_shipping_threshold: 50000,
    store_name: 'CHRONYX',
    contact_email: 'hello@chronyx.in',
    whatsapp_number: '',
    express_shipping_enabled: false,
    express_shipping_fee: 1500,
    upi_enabled: true,
    card_enabled: true,
    netbanking_enabled: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('key', 'store_settings').single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
      
      if (data && data.value) {
        setSettings(prev => ({ ...prev, ...data.value }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: 'store_settings', value: settings });
      
      if (error) throw error;
      alert('Global settings saved successfully!');
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Global Settings</h2>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FloppyDisk size={16} /> Save Settings
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* General Preferences */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Store Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Store Name</label>
              <input type="text" name="store_name" value={settings.store_name} onChange={handleChange} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Free Shipping Threshold (₹)</label>
              <input type="number" name="free_shipping_threshold" value={settings.free_shipping_threshold} onChange={handleChange} />
            </div>
            
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" name="maintenance_mode" checked={settings.maintenance_mode} onChange={handleChange} style={{ width: 'auto' }} />
                <span style={{ color: settings.maintenance_mode ? 'var(--danger)' : 'inherit' }}>
                  Enable Maintenance Mode (Takes site offline)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Configurations */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Shipping Options</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" name="express_shipping_enabled" checked={settings.express_shipping_enabled} onChange={handleChange} style={{ width: 'auto' }} />
                <span>Enable Express Shipping</span>
              </label>
            </div>
            
            {settings.express_shipping_enabled && (
              <div style={{ marginLeft: '28px', padding: '12px', background: 'var(--surface-2)', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Express Shipping Fee (₹)</label>
                <input type="number" name="express_shipping_fee" value={settings.express_shipping_fee} onChange={handleChange} />
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>Payment Methods</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" name="upi_enabled" checked={settings.upi_enabled} onChange={handleChange} style={{ width: 'auto' }} />
                <span>UPI (Razorpay)</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" name="card_enabled" checked={settings.card_enabled} onChange={handleChange} style={{ width: 'auto' }} />
                <span>Credit/Debit Cards (Razorpay)</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" name="netbanking_enabled" checked={settings.netbanking_enabled} onChange={handleChange} style={{ width: 'auto' }} />
                <span>Netbanking (Razorpay)</span>
              </label>
            </div>

            <hr style={{ borderColor: 'var(--border)' }} />

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" name="cod_enabled" checked={settings.cod_enabled} onChange={handleChange} style={{ width: 'auto' }} />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>

            {settings.cod_enabled && (
              <div style={{ marginLeft: '28px', padding: '12px', background: 'var(--surface-2)', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>COD Handling Fee (₹)</label>
                <input type="number" name="cod_fee" value={settings.cod_fee} onChange={handleChange} />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
