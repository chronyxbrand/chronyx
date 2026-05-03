import React, { useEffect, useMemo, useState } from 'react';
import { FloppyDisk, Plus, Trash } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const defaultNavLinks = [
  { label: 'Home', path: '/', visible: true },
  { label: 'Shop', path: '/shop', visible: true },
  { label: 'About', path: '/about', visible: true },
  { label: 'Journal', path: '/blog', visible: true },
  { label: 'Contact', path: '/contact', visible: true },
];

const defaultFooterContent = {
  brandCopy: '',
  exploreHeading: 'Explore',
  exploreLinks: [
    { label: 'Shop All', path: '/shop', visible: true },
    { label: 'Our Story', path: '/about', visible: true },
    { label: 'Journal', path: '/blog', visible: true },
    { label: 'Contact', path: '/contact', visible: true },
  ],
  supportHeading: 'Legal',
  supportLinks: [
    { label: 'Privacy & Policies', path: '/policies', visible: true },
    { label: 'Track Order', path: '/track', visible: true },
    { label: 'My Account', path: '/account', visible: true },
  ],
  newsletterHeading: 'Stay Updated',
  newsletterText: '',
};

function LinkRow({ link, index, onChange, onRemove }) {
  return (
    <div className="nav-link-row">
      <div className="nav-link-fields">
        <label className="settings-label">
          Label
          <input
            type="text"
            value={link.label}
            onChange={(event) => onChange(index, 'label', event.target.value)}
            placeholder="Link label"
          />
        </label>
        <label className="settings-label">
          Path
          <input
            type="text"
            value={link.path}
            onChange={(event) => onChange(index, 'path', event.target.value)}
            placeholder="/shop"
          />
        </label>
      </div>
      <label className="settings-toggle-row">
        <div className="settings-toggle-copy">
          <strong>{link.visible === false ? 'Hidden' : 'Visible'}</strong>
          <small>Toggle this link on or off without deleting it.</small>
        </div>
        <div className="settings-toggle-control">
          <span className={`settings-toggle-state ${link.visible === false ? 'is-off' : 'is-on'}`}>
            {link.visible === false ? 'Off' : 'On'}
          </span>
          <input
            type="checkbox"
            checked={link.visible !== false}
            onChange={(event) => onChange(index, 'visible', event.target.checked)}
          />
        </div>
      </label>
      <button type="button" className="btn-secondary nav-remove-btn" onClick={() => onRemove(index)}>
        <Trash size={16} />
        Remove
      </button>
    </div>
  );
}

function NavigationManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [navLinks, setNavLinks] = useState(defaultNavLinks);
  const [footerContent, setFooterContent] = useState(defaultFooterContent);

  useEffect(() => {
    const fetchNavigation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['navigation_content', 'footer_content']);

        if (error) throw error;

        const navData = data?.find((item) => item.key === 'navigation_content')?.value;
        const footerData = data?.find((item) => item.key === 'footer_content')?.value;

        if (navData?.links?.length) {
          setNavLinks(navData.links.map((link) => ({ visible: true, ...link })));
        }

        if (footerData) {
          setFooterContent({
            ...defaultFooterContent,
            ...footerData,
            exploreLinks: (footerData.exploreLinks || defaultFooterContent.exploreLinks).map((link) => ({
              visible: true,
              ...link,
            })),
            supportLinks: (footerData.supportLinks || defaultFooterContent.supportLinks).map((link) => ({
              visible: true,
              ...link,
            })),
          });
        }
      } catch (error) {
        console.error('Error fetching navigation content:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();
  }, []);

  const summary = useMemo(
    () => ({
      navVisible: navLinks.filter((link) => link.visible !== false).length,
      exploreVisible: footerContent.exploreLinks.filter((link) => link.visible !== false).length,
      supportVisible: footerContent.supportLinks.filter((link) => link.visible !== false).length,
    }),
    [footerContent.exploreLinks, footerContent.supportLinks, navLinks],
  );

  const updateLinks = (setter, links, index, field, value) => {
    setter(links.map((link, linkIndex) => (linkIndex === index ? { ...link, [field]: value } : link)));
  };

  const addLink = (setter, links) => {
    setter([...links, { label: '', path: '', visible: true }]);
  };

  const removeLink = (setter, links, index) => {
    setter(links.filter((_, linkIndex) => linkIndex !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const navigationPayload = {
        links: navLinks
          .map((link) => ({
            label: String(link.label || '').trim(),
            path: String(link.path || '').trim(),
            visible: link.visible !== false,
          }))
          .filter((link) => link.label && link.path),
      };

      const footerPayload = {
        ...footerContent,
        exploreLinks: footerContent.exploreLinks
          .map((link) => ({
            label: String(link.label || '').trim(),
            path: String(link.path || '').trim(),
            visible: link.visible !== false,
          }))
          .filter((link) => link.label && link.path),
        supportLinks: footerContent.supportLinks
          .map((link) => ({
            label: String(link.label || '').trim(),
            path: String(link.path || '').trim(),
            visible: link.visible !== false,
          }))
          .filter((link) => link.label && link.path),
      };

      const { error } = await supabase.from('settings').upsert([
        { key: 'navigation_content', value: navigationPayload },
        { key: 'footer_content', value: footerPayload },
      ]);

      if (error) throw error;
      alert('Navigation and footer links saved successfully.');
    } catch (error) {
      alert(`Failed to save navigation settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading navigation controls...</div>;

  return (
    <div className="settings-page">
      <div className="page-header settings-header">
        <div>
          <p className="settings-page-eyebrow">Structure Controls</p>
          <h2>Navigation + Footer Manager</h2>
          <p>Control the customer-facing header links and footer link groups without editing code.</p>
        </div>
        <button className="btn-primary settings-save-btn" onClick={handleSave} disabled={saving}>
          <FloppyDisk size={16} />
          {saving ? 'Saving...' : 'Save Structure'}
        </button>
      </div>

      <div className="settings-summary-row">
        <div className="settings-summary-chip">
          <span>Header Links</span>
          <strong>{summary.navVisible} visible</strong>
        </div>
        <div className="settings-summary-chip">
          <span>Footer Explore</span>
          <strong>{summary.exploreVisible} visible</strong>
        </div>
        <div className="settings-summary-chip">
          <span>Footer Support</span>
          <strong>{summary.supportVisible} visible</strong>
        </div>
      </div>

      <div className="settings-layout">
        <div className="settings-column">
          <section className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <p className="settings-panel-eyebrow">Header</p>
                <h3>Primary Navigation</h3>
                <p>These links power the public site header. Journal visibility still respects the main journal toggle.</p>
              </div>
              <button type="button" className="btn-secondary" onClick={() => addLink(setNavLinks, navLinks)}>
                <Plus size={16} />
                Add Link
              </button>
            </div>
            <div className="settings-panel-body nav-link-stack">
              {navLinks.map((link, index) => (
                <LinkRow
                  key={`nav-${index}`}
                  link={link}
                  index={index}
                  onChange={(rowIndex, field, value) => updateLinks(setNavLinks, navLinks, rowIndex, field, value)}
                  onRemove={(rowIndex) => removeLink(setNavLinks, navLinks, rowIndex)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="settings-column">
          <section className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <p className="settings-panel-eyebrow">Footer</p>
                <h3>Explore Group</h3>
                <p>Control the first footer column and the heading customers see there.</p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setFooterContent((current) => ({
                    ...current,
                    exploreLinks: [...current.exploreLinks, { label: '', path: '', visible: true }],
                  }))
                }
              >
                <Plus size={16} />
                Add Explore Link
              </button>
            </div>
            <div className="settings-panel-body nav-link-stack">
              <label className="settings-label">
                Explore Heading
                <input
                  type="text"
                  value={footerContent.exploreHeading}
                  onChange={(event) =>
                    setFooterContent((current) => ({ ...current, exploreHeading: event.target.value }))
                  }
                />
              </label>
              {footerContent.exploreLinks.map((link, index) => (
                <LinkRow
                  key={`explore-${index}`}
                  link={link}
                  index={index}
                  onChange={(rowIndex, field, value) =>
                    setFooterContent((current) => ({
                      ...current,
                      exploreLinks: current.exploreLinks.map((item, itemIndex) =>
                        itemIndex === rowIndex ? { ...item, [field]: value } : item,
                      ),
                    }))
                  }
                  onRemove={(rowIndex) =>
                    setFooterContent((current) => ({
                      ...current,
                      exploreLinks: current.exploreLinks.filter((_, itemIndex) => itemIndex !== rowIndex),
                    }))
                  }
                />
              ))}
            </div>
          </section>

          <section className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <p className="settings-panel-eyebrow">Footer</p>
                <h3>Support Group</h3>
                <p>Manage the second footer column, including policy, tracking, and account links.</p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setFooterContent((current) => ({
                    ...current,
                    supportLinks: [...current.supportLinks, { label: '', path: '', visible: true }],
                  }))
                }
              >
                <Plus size={16} />
                Add Support Link
              </button>
            </div>
            <div className="settings-panel-body nav-link-stack">
              <label className="settings-label">
                Support Heading
                <input
                  type="text"
                  value={footerContent.supportHeading}
                  onChange={(event) =>
                    setFooterContent((current) => ({ ...current, supportHeading: event.target.value }))
                  }
                />
              </label>
              {footerContent.supportLinks.map((link, index) => (
                <LinkRow
                  key={`support-${index}`}
                  link={link}
                  index={index}
                  onChange={(rowIndex, field, value) =>
                    setFooterContent((current) => ({
                      ...current,
                      supportLinks: current.supportLinks.map((item, itemIndex) =>
                        itemIndex === rowIndex ? { ...item, [field]: value } : item,
                      ),
                    }))
                  }
                  onRemove={(rowIndex) =>
                    setFooterContent((current) => ({
                      ...current,
                      supportLinks: current.supportLinks.filter((_, itemIndex) => itemIndex !== rowIndex),
                    }))
                  }
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default NavigationManager;
