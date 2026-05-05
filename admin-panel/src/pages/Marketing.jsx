import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Tag, EnvelopeSimple, PencilSimple, X } from '@phosphor-icons/react';

function OverviewCard({ label, value, body }) {
  return (
    <div className="card marketing-overview-card">
      <p className="marketing-overview-label">{label}</p>
      <h3>{value}</h3>
      <p>{body}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="marketing-empty">{text}</p>;
}

const defaultCouponForm = {
  id: '',
  code: '',
  discount_percent: 10,
  max_uses: '',
  expires_at: '',
  is_active: true,
};

const defaultBlastForm = {
  segment: 'all',
  subject: '',
  message: '',
  ctaLabel: '',
  ctaUrl: '',
};

const Marketing = () => {
  const [coupons, setCoupons] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponForm, setCouponForm] = useState(defaultCouponForm);
  const [couponEditorOpen, setCouponEditorOpen] = useState(false);
  const [couponSaving, setCouponSaving] = useState(false);
  const [blastForm, setBlastForm] = useState(defaultBlastForm);
  const [blastEditorOpen, setBlastEditorOpen] = useState(false);
  const [blastSending, setBlastSending] = useState(false);

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const { data: couponsData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      const { data: waitlistData } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });

      setCoupons(couponsData || []);
      setWaitlist(waitlistData || []);
    } catch (error) {
      console.error('Error fetching marketing data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const couponSummary = useMemo(() => {
    const active = coupons.filter((coupon) => coupon.is_active).length;
    const expired = coupons.length - active;
    return { active, expired };
  }, [coupons]);

  const waitlistSummary = useMemo(() => {
    const newsletter = waitlist.filter((subscriber) => subscriber.is_newsletter).length;
    const product = waitlist.length - newsletter;
    return { newsletter, product };
  }, [waitlist]);

  const openNewCouponForm = () => {
    setCouponForm(defaultCouponForm);
    setCouponEditorOpen(true);
  };

  const openEditCouponForm = (coupon) => {
    setCouponForm({
      id: coupon.id,
      code: coupon.code || '',
      discount_percent:
        coupon.discount_percent ??
        (coupon.discount_type === 'percentage' || coupon.type === 'percent'
          ? Number(coupon.discount_value) || 10
          : 10),
      max_uses: coupon.max_uses ?? '',
      expires_at: (coupon.expires_at || coupon.expiry_date)
        ? new Date(coupon.expires_at || coupon.expiry_date).toISOString().slice(0, 16)
        : '',
      is_active: Boolean(coupon.is_active),
    });
    setCouponEditorOpen(true);
  };

  const closeCouponForm = () => {
    setCouponEditorOpen(false);
    setCouponForm(defaultCouponForm);
  };

  const openBlastEditor = () => {
    setBlastEditorOpen(true);
  };

  const closeBlastEditor = () => {
    setBlastEditorOpen(false);
    setBlastForm(defaultBlastForm);
  };

  const handleCouponFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setCouponForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlastFieldChange = (event) => {
    const { name, value } = event.target;
    setBlastForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCouponSave = async (event) => {
    event.preventDefault();
    if (!couponForm.code.trim()) {
      alert('Coupon code is required.');
      return;
    }

    const discountPercent = Number(couponForm.discount_percent);
    if (!Number.isFinite(discountPercent) || discountPercent <= 0) {
      alert('Discount percent must be greater than 0.');
      return;
    }

    setCouponSaving(true);
    try {
      const normalizedExpiry = couponForm.expires_at ? new Date(couponForm.expires_at).toISOString() : null;
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discount_percent: discountPercent,
        discount_type: 'percentage',
        discount_value: discountPercent,
        type: 'percent',
        is_active: couponForm.is_active,
        max_uses: couponForm.max_uses === '' ? null : Number(couponForm.max_uses),
        min_order_amount: 0,
        one_per_customer: false,
        expires_at: normalizedExpiry,
        expiry_date: normalizedExpiry,
      };

      if (couponForm.id) {
        payload.id = couponForm.id;
      } else {
        payload.times_used = 0;
      }

      const { error } = await supabase.from('coupons').upsert(payload);
      if (error) throw error;

      await fetchMarketingData();
      closeCouponForm();
      alert(couponForm.id ? 'Coupon updated successfully.' : 'Coupon created successfully.');
    } catch (error) {
      alert(`Error saving coupon: ${error.message}`);
    } finally {
      setCouponSaving(false);
    }
  };

  const handleCouponStatusToggle = async (coupon) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);

      if (error) throw error;
      await fetchMarketingData();
    } catch (error) {
      alert(`Error updating coupon status: ${error.message}`);
    }
  };

  const handleSendBlast = async (event) => {
    event.preventDefault();

    if (!blastForm.subject.trim() || !blastForm.message.trim()) {
      alert('Subject and message are required.');
      return;
    }

    setBlastSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          segment: blastForm.segment,
          subject: blastForm.subject.trim(),
          message: blastForm.message.trim(),
          ctaLabel: blastForm.ctaLabel.trim(),
          ctaUrl: blastForm.ctaUrl.trim(),
        },
      });

      if (error) throw error;

      alert(`Email sent successfully to ${data?.recipients || 'your selected audience'} recipient(s).`);
      closeBlastEditor();
    } catch (error) {
      alert(
        `Email send failed: ${error.message}. Deploy the 'send-marketing-email' edge function and set the Resend secrets first.`,
      );
    } finally {
      setBlastSending(false);
    }
  };

  if (loading) return <div>Loading marketing data...</div>;

  return (
    <div className="marketing-page">
      <div className="page-header">
        <div>
          <h2>Marketing &amp; Promotions</h2>
          <p className="cms-page-subtitle">
            Review coupons, newsletter growth, and product-interest signups without changing the existing logic.
          </p>
        </div>
      </div>

      <section className="marketing-overview-grid">
        <OverviewCard
          label="Coupons"
          value={`${coupons.length} total`}
          body={`${couponSummary.active} active and ${couponSummary.expired} inactive or expired.`}
        />
        <OverviewCard
          label="Audience"
          value={`${waitlist.length} subscribers`}
          body={`${waitlistSummary.newsletter} newsletter and ${waitlistSummary.product} product waitlist signups.`}
        />
        <OverviewCard
          label="Next Step"
          value="Campaign Ready"
          body="Use this view to monitor demand before creating the next manual campaign or drop."
        />
      </section>

      <div className="marketing-grid">
        <section className="card marketing-card">
          <div className="marketing-section-header">
            <div>
              <h3>Discount Codes</h3>
              <p>Track active offers and review which promotions are still available.</p>
            </div>
            <button className="btn-secondary marketing-action-btn" onClick={openNewCouponForm}>
              <Plus size={16} />
              New Coupon
            </button>
          </div>

          {couponEditorOpen ? (
            <form className="marketing-editor-card" onSubmit={handleCouponSave}>
              <div className="marketing-editor-header">
                <div>
                  <h4>{couponForm.id ? 'Edit Coupon' : 'Create Coupon'}</h4>
                  <p>These fields feed the same coupon logic currently used on checkout.</p>
                </div>
                <button type="button" className="btn-secondary marketing-icon-btn" onClick={closeCouponForm}>
                  <X size={16} />
                </button>
              </div>

              <div className="marketing-form-grid">
                <div className="marketing-form-two-col">
                  <div>
                    <label className="settings-label">Coupon Code</label>
                    <input
                      type="text"
                      name="code"
                      value={couponForm.code}
                      onChange={handleCouponFieldChange}
                      placeholder="e.g. CHRONYX10"
                    />
                  </div>
                  <div>
                    <label className="settings-label">Discount Percent</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      name="discount_percent"
                      value={couponForm.discount_percent}
                      onChange={handleCouponFieldChange}
                    />
                  </div>
                </div>

                <div className="marketing-form-two-col">
                  <div>
                    <label className="settings-label">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      name="max_uses"
                      value={couponForm.max_uses}
                      onChange={handleCouponFieldChange}
                      placeholder="Leave blank for unlimited"
                    />
                    <p className="settings-hint">Leave blank if the coupon should not have a cap.</p>
                  </div>
                  <div>
                    <label className="settings-label">Expiry Date</label>
                    <input
                      type="datetime-local"
                      name="expires_at"
                      value={couponForm.expires_at}
                      onChange={handleCouponFieldChange}
                    />
                  </div>
                </div>

                <label className="settings-toggle">
                  <div className="settings-toggle-copy">
                    <span>Coupon is active</span>
                    <small>Inactive coupons stay in admin but cannot be applied on checkout.</small>
                  </div>
                  <input
                    className="admin-toggle-input"
                    type="checkbox"
                    name="is_active"
                    checked={couponForm.is_active}
                    onChange={handleCouponFieldChange}
                  />
                </label>

                <div className="marketing-editor-actions">
                  <button type="button" className="btn-secondary" onClick={closeCouponForm}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary marketing-action-btn" disabled={couponSaving}>
                    {couponSaving ? 'Saving...' : couponForm.id ? 'Save Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          {coupons.length === 0 ? (
            <EmptyState text="No coupons yet. Create your first one above." />
          ) : (
            <div className="marketing-table-wrap">
              <table className="marketing-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Discount</th>
                    <th>Usage</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="marketing-code-cell">
                        <Tag size={14} />
                        <span>{coupon.code}</span>
                      </td>
                      <td>
                        {coupon.discount_percent ? `${coupon.discount_percent}%` : 'N/A'}
                      </td>
                      <td>
                        {coupon.max_uses
                          ? `${coupon.times_used || 0} / ${coupon.max_uses}`
                          : `${coupon.times_used || 0} used`}
                      </td>
                      <td>{coupon.expires_at ? new Date(coupon.expires_at).toLocaleString() : 'No expiry'}</td>
                      <td>
                        <span className={`marketing-status ${coupon.is_active ? 'is-active' : 'is-inactive'}`}>
                          {coupon.is_active ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td>
                        <div className="marketing-row-actions">
                          <button
                            type="button"
                            className="btn-secondary marketing-mini-btn"
                            onClick={() => openEditCouponForm(coupon)}
                          >
                            <PencilSimple size={14} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-secondary marketing-mini-btn"
                            onClick={() => handleCouponStatusToggle(coupon)}
                          >
                            {coupon.is_active ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card marketing-card">
          <div className="marketing-section-header">
            <div>
              <h3>Waitlist &amp; Newsletter</h3>
              <p>Watch audience growth and identify whether interest is broader or product-specific.</p>
            </div>
            <button className="btn-secondary marketing-action-btn" onClick={openBlastEditor}>
              <EnvelopeSimple size={16} />
              Send Email Blast
            </button>
          </div>

          {blastEditorOpen ? (
            <form className="marketing-editor-card" onSubmit={handleSendBlast}>
              <div className="marketing-editor-header">
                <div>
                  <h4>Send Campaign Email</h4>
                  <p>Send a branded update to newsletter subscribers, product waitlists, or everyone together.</p>
                </div>
                <button type="button" className="btn-secondary marketing-icon-btn" onClick={closeBlastEditor}>
                  <X size={16} />
                </button>
              </div>

              <div className="marketing-form-grid">
                <div className="marketing-form-two-col">
                  <div>
                    <label className="settings-label">Audience</label>
                    <select name="segment" value={blastForm.segment} onChange={handleBlastFieldChange}>
                      <option value="all">All subscribers and waitlists</option>
                      <option value="subscribers">Footer and signup subscribers</option>
                      <option value="newsletter">Newsletter waitlist only</option>
                      <option value="waitlist">Product waitlist only</option>
                    </select>
                  </div>
                  <div>
                    <label className="settings-label">CTA Label</label>
                    <input
                      type="text"
                      name="ctaLabel"
                      value={blastForm.ctaLabel}
                      onChange={handleBlastFieldChange}
                      placeholder="Optional button text"
                    />
                  </div>
                </div>

                <div>
                  <label className="settings-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={blastForm.subject}
                    onChange={handleBlastFieldChange}
                    placeholder="e.g. The Walnut Drop is Live"
                  />
                </div>

                <div>
                  <label className="settings-label">Message</label>
                  <textarea
                    rows={6}
                    name="message"
                    value={blastForm.message}
                    onChange={handleBlastFieldChange}
                    placeholder="Write the campaign message here. Separate paragraphs with line breaks."
                  />
                </div>

                <div>
                  <label className="settings-label">CTA URL</label>
                  <input
                    type="url"
                    name="ctaUrl"
                    value={blastForm.ctaUrl}
                    onChange={handleBlastFieldChange}
                    placeholder="https://chronyx.in/shop"
                  />
                </div>

                <div className="marketing-editor-actions">
                  <button type="button" className="btn-secondary" onClick={closeBlastEditor}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary marketing-action-btn" disabled={blastSending}>
                    {blastSending ? 'Sending...' : 'Send Campaign'}
                  </button>
                </div>
              </div>
            </form>
          ) : null}

          {waitlist.length === 0 ? (
            <EmptyState text="No subscribers yet." />
          ) : (
            <div className="marketing-table-wrap">
              <table className="marketing-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Segment</th>
                    <th>Source</th>
                    <th>Date Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td>{subscriber.email}</td>
                      <td>
                        <span className="marketing-pill">
                          {subscriber.is_newsletter ? 'Newsletter' : 'Product Waitlist'}
                        </span>
                      </td>
                      <td>{subscriber.product_id ? 'Product page' : 'General signup'}</td>
                      <td>{new Date(subscriber.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Marketing;
