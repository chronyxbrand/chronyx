import React, { useEffect, useMemo, useState } from 'react';
import { FloppyDisk } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const defaultSettings = {
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
  netbanking_enabled: true,
  show_journal: false,
};

const paymentFields = [
  {
    name: 'upi_enabled',
    title: 'UPI',
    body: 'Fast mobile-first checkout for most customers.',
  },
  {
    name: 'card_enabled',
    title: 'Cards',
    body: 'Keeps debit and credit card payment visible.',
  },
  {
    name: 'netbanking_enabled',
    title: 'Net banking',
    body: 'Supports customers who prefer direct bank payment.',
  },
];

function SettingsPanel({ eyebrow, title, body, children }) {
  return (
    <section className="settings-panel">
      <div className="settings-panel-header">
        <p className="settings-panel-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <div className="settings-panel-body">{children}</div>
    </section>
  );
}

function SettingsLabel({ children }) {
  return <label className="settings-label">{children}</label>;
}

function SettingsHint({ children }) {
  return <p className="settings-hint">{children}</p>;
}

function ToggleRow({ name, checked, onChange, title, body, danger = false }) {
  return (
    <label className={`settings-toggle-row ${danger ? 'is-danger' : ''}`}>
      <div className="settings-toggle-copy">
        <strong>{title}</strong>
        {body ? <small>{body}</small> : null}
      </div>
      <div className="settings-toggle-control">
        <span className={`settings-toggle-state ${checked ? 'is-on' : 'is-off'}`}>{checked ? 'On' : 'Off'}</span>
        <input className="admin-toggle-input" type="checkbox" name={name} checked={checked} onChange={onChange} />
      </div>
    </label>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="settings-summary-chip">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('key', 'store_settings').single();
      if (error && error.code !== 'PGRST116') throw error;

      if (data?.value) {
        setSettings((prev) => ({ ...prev, ...data.value }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').upsert({ key: 'store_settings', value: settings });
      if (error) throw error;
      alert('Global settings saved successfully!');
    } catch (error) {
      alert(`Error saving settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const enabledPayments = useMemo(
    () =>
      [settings.upi_enabled, settings.card_enabled, settings.netbanking_enabled, settings.cod_enabled].filter(Boolean)
        .length,
    [settings],
  );

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="settings-page settings-redesign">
      <div className="page-header settings-header">
        <div>
          <p className="settings-page-eyebrow">Store Controls</p>
          <h2>Settings</h2>
          <p className="cms-page-subtitle">
            Manage the storefront rules, contact details, payment visibility, and delivery controls from one place.
          </p>
        </div>
        <button className="btn-primary settings-save-btn" onClick={handleSave} disabled={saving}>
          <FloppyDisk size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-summary-row">
        <SummaryChip label="Store" value={settings.maintenance_mode ? 'Paused' : 'Live'} />
        <SummaryChip label="Payments" value={`${enabledPayments} enabled`} />
        <SummaryChip
          label="Free Shipping"
          value={`INR ${Number(settings.free_shipping_threshold || 0).toLocaleString('en-IN')}`}
        />
        <SummaryChip
          label="Journal"
          value={settings.show_journal ? 'Visible' : 'Hidden'}
        />
      </div>

      <div className="settings-layout">
        <div className="settings-column">
          <SettingsPanel
            eyebrow="Brand"
            title="Store identity"
            body="Business details used across support, branding, and customer communication."
          >
            <div className="settings-form-grid">
              <div>
                <SettingsLabel>Store Name</SettingsLabel>
                <input type="text" name="store_name" value={settings.store_name} onChange={handleChange} />
              </div>

              <div className="settings-two-col">
                <div>
                  <SettingsLabel>Support Email</SettingsLabel>
                  <input type="email" name="contact_email" value={settings.contact_email} onChange={handleChange} />
                </div>
                <div>
                  <SettingsLabel>WhatsApp Number</SettingsLabel>
                  <input
                    type="text"
                    name="whatsapp_number"
                    value={settings.whatsapp_number}
                    onChange={handleChange}
                    placeholder="e.g. 919876543210"
                  />
                </div>
              </div>
            </div>
          </SettingsPanel>

          <SettingsPanel
            eyebrow="Shipping"
            title="Delivery pricing"
            body="Control thresholds and optional delivery fees shown during checkout."
          >
            <div className="settings-form-grid">
              <div>
                <SettingsLabel>Free Shipping Threshold (INR)</SettingsLabel>
                <input
                  type="number"
                  name="free_shipping_threshold"
                  value={settings.free_shipping_threshold}
                  onChange={handleChange}
                />
                <SettingsHint>Orders above this amount qualify for free standard shipping.</SettingsHint>
              </div>

              {settings.express_shipping_enabled ? (
                <div className="settings-inline-panel">
                  <SettingsLabel>Express Shipping Fee (INR)</SettingsLabel>
                  <input
                    type="number"
                    name="express_shipping_fee"
                    value={settings.express_shipping_fee}
                    onChange={handleChange}
                  />
                </div>
              ) : null}

              {settings.cod_enabled ? (
                <div className="settings-inline-panel">
                  <SettingsLabel>COD Handling Fee (INR)</SettingsLabel>
                  <input type="number" name="cod_fee" value={settings.cod_fee} onChange={handleChange} />
                </div>
              ) : null}
            </div>
          </SettingsPanel>
        </div>

        <div className="settings-column">
          <SettingsPanel
            eyebrow="Storefront"
            title="Operational switches"
            body="Toggle customer-facing delivery and storefront availability states."
          >
            <div className="settings-toggle-stack">
              <ToggleRow
                name="express_shipping_enabled"
                checked={settings.express_shipping_enabled}
                onChange={handleChange}
                title="Express shipping"
                body="Shows a faster premium delivery option during checkout."
              />
              <ToggleRow
                name="cod_enabled"
                checked={settings.cod_enabled}
                onChange={handleChange}
                title="Cash on Delivery"
                body="Keeps COD visible as an available checkout method."
              />
              <ToggleRow
                name="maintenance_mode"
                checked={settings.maintenance_mode}
                onChange={handleChange}
                title="Maintenance mode"
                body="Use only when you intentionally want to pause storefront access."
                danger
              />
              <ToggleRow
                name="show_journal"
                checked={settings.show_journal}
                onChange={handleChange}
                title="Show Journal on storefront"
                body="Controls whether customers can see the Journal tab, footer link, and article pages."
              />
            </div>
          </SettingsPanel>

          <SettingsPanel
            eyebrow="Payments"
            title="Accepted payment methods"
            body="These toggles control which payment choices customers see during checkout."
          >
            <div className="settings-toggle-stack">
              {paymentFields.map((item) => (
                <ToggleRow
                  key={item.name}
                  name={item.name}
                  checked={settings[item.name]}
                  onChange={handleChange}
                  title={item.title}
                  body={item.body}
                />
              ))}
            </div>
          </SettingsPanel>
        </div>
      </div>
    </div>
  );
};

export default Settings;
