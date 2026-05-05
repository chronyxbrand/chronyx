import { useEffect, useState } from 'react';
import { FloppyDisk, Spinner, UploadSimple } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const defaultHero = {
  headline: '',
  subtext: '',
};

const defaultPolicies = {
  privacy: '',
  terms: '',
  refund: '',
  shipping: '',
};

const defaultHomepage = {
  heroEyebrow: 'Premium Wooden Wall Clocks',
  heroImage: '',
  signatureImage: '',
  secondaryFeatureImage: '',
  processDesignImage: '',
  processMaterialImage: '',
  processCraftImage: '',
  processFinishImage: '',
  collectionEyebrow: 'Collection',
  collectionHeadline: '',
  collectionSummary: '',
  socialEyebrow: 'Follow The Atelier',
  socialHeadline: '@chronyx.studio',
  founderQuote: '',
  trustItemsText: '',
  pressMentionsText: '',
  testimonialsText: '',
  socialImagesText: '',
};

const defaultAbout = {
  eyebrow: 'About Us',
  title: 'The CHRONYX Story',
  introHeadline: '',
  introBody: '',
  storyCardsText: '',
  makingOfEyebrow: 'Behind The Scenes',
  makingOfHeadline: 'The Art of Assembly.',
  makingOfItemsText: '',
};

const defaultContact = {
  eyebrow: 'Contact',
  title: 'Get in Touch',
  introHeadline: 'Send us a message',
  introBody: '',
  supportHeading: 'Customer Support',
  supportBody: '',
  supportEmail: 'support@chronyx.in',
  studioAddress: '',
  successTitle: 'Message Sent',
  successBody: '',
};

const defaultFooter = {
  brandCopy: '',
  exploreHeading: 'Explore',
  exploreLinksText: 'Shop All|/shop\nOur Story|/about\nJournal|/blog\nContact|/contact',
  supportHeading: 'Legal',
  supportLinksText: 'Privacy & Policies|/policies\nTrack Order|/track\nMy Account|/account',
  newsletterHeading: 'Stay Updated',
  newsletterText: '',
};

const joinLines = (items = [], formatter) => items.map(formatter).join('\n');

const parseSimpleLines = (value) =>
  String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const parsePipeLines = (value, keys) =>
  parseSimpleLines(value)
    .map((line) => line.split('|').map((part) => part.trim()))
    .filter((parts) => parts.length >= keys.length && parts.every(Boolean))
    .map((parts) =>
      keys.reduce((acc, key, index) => {
        acc[key] = parts[index] || '';
        return acc;
      }, {}),
    );

const sections = [
  { id: 'hero', label: 'Hero' },
  { id: 'homepage', label: 'Homepage' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
  { id: 'policies', label: 'Policies' },
  { id: 'footer', label: 'Footer' },
];

const getSectionStatus = (count, total) => {
  if (count === total) return 'Ready';
  if (count === 0) return 'Empty';
  return 'In Progress';
};

function FieldLabel({ children }) {
  return <label className="cms-field-label">{children}</label>;
}

function FieldHint({ children }) {
  return <p className="cms-field-hint">{children}</p>;
}

function SectionHeader({ title, body }) {
  return (
    <div className="cms-section-header">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function PreviewNote({ title, children }) {
  return (
    <div className="cms-preview-note">
      <p className="cms-preview-note-label">{title}</p>
      <div className="cms-preview-note-body">{children}</div>
    </div>
  );
}

function SaveButton({ onClick, disabled, label }) {
  return (
    <button className="btn-primary cms-save-btn" onClick={onClick} disabled={disabled}>
      <FloppyDisk size={16} />
      {label}
    </button>
  );
}

function ImageSlotField({ label, hint, value, previewValue, onChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!cloudName || !uploadPreset) {
      alert('Cloudinary upload is not configured in the admin panel environment.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      onChange(data.secure_url);
    } catch (error) {
      console.error('Homepage image upload error:', error);
      alert('Failed to upload homepage image. Please try again.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="cms-image-slot">
      <FieldLabel>{label}</FieldLabel>

      <div className="cms-image-slot-preview">
        {previewValue ? (
          <>
            <img src={previewValue} alt={label} />
            <span className="cms-image-slot-badge">{value ? 'Current custom image' : 'Current live fallback'}</span>
          </>
        ) : (
          <div className="cms-image-slot-empty">
            <UploadSimple size={20} />
            <span>No image selected yet</span>
          </div>
        )}
      </div>

      <div className="cms-image-slot-controls">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
        <label className="cms-upload-trigger">
          {isUploading ? (
            <>
              <Spinner size={16} className="spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadSimple size={16} />
              Upload
            </>
          )}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      {previewValue ? (
        <div className="cms-image-slot-meta">
          <span>{value ? 'Custom slot URL' : 'Current fallback URL'}</span>
          <code>{previewValue}</code>
        </div>
      ) : null}

      <FieldHint>{hint}</FieldHint>
    </div>
  );
}

function Content() {
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [productLibrary, setProductLibrary] = useState([]);

  const [heroText, setHeroText] = useState(defaultHero);
  const [policies, setPolicies] = useState(defaultPolicies);
  const [homepageContent, setHomepageContent] = useState(defaultHomepage);
  const [aboutContent, setAboutContent] = useState(defaultAbout);
  const [contactContent, setContactContent] = useState(defaultContact);
  const [footerContent, setFooterContent] = useState(defaultFooter);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      const { data: productRows, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, product_images(image_url, is_hero)');
      if (productsError) throw productsError;

      const mappedProducts = (productRows || []).map((product) => {
        const gallery = (product.product_images || []).map((item) => item.image_url).filter(Boolean);
        const hero = product.product_images?.find((item) => item.is_hero)?.image_url || gallery[0] || '';

        return {
          id: product.id,
          name: product.name,
          hero,
          gallery,
        };
      });

      setProductLibrary(mappedProducts);

      const heroData = data.find((item) => item.key === 'hero_text');
      if (heroData?.value) {
        setHeroText((current) => ({ ...current, ...heroData.value }));
      }

      const policyData = data.find((item) => item.key === 'store_policies');
      if (policyData?.value) {
        setPolicies((current) => ({ ...current, ...policyData.value }));
      }

      const homepageData = data.find((item) => item.key === 'homepage_content');
      if (homepageData?.value) {
        setHomepageContent((current) => ({
          ...current,
          ...homepageData.value,
          trustItemsText: joinLines(homepageData.value.trustItems || [], (item) => `${item.title}|${item.body}`),
          pressMentionsText: joinLines(homepageData.value.pressMentions || [], (item) => item),
          testimonialsText: joinLines(
            homepageData.value.testimonials || [],
            (item) => `${item.quote}|${item.author}|${item.location}`,
          ),
          socialImagesText: joinLines(homepageData.value.socialImages || [], (item) => item),
        }));
      }

      const aboutData = data.find((item) => item.key === 'about_page_content');
      if (aboutData?.value) {
        setAboutContent((current) => ({
          ...current,
          ...aboutData.value,
          storyCardsText: joinLines(aboutData.value.storyCards || [], (item) => `${item.title}|${item.body}`),
          makingOfItemsText: joinLines(
            aboutData.value.makingOfItems || [],
            (item) => `${item.img}|${item.title}|${item.text}`,
          ),
        }));
      }

      const contactData = data.find((item) => item.key === 'contact_page_content');
      if (contactData?.value) {
        setContactContent((current) => ({ ...current, ...contactData.value }));
      }

      const footerData = data.find((item) => item.key === 'footer_content');
      if (footerData?.value) {
        setFooterContent((current) => ({
          ...current,
          ...footerData.value,
          exploreLinksText: joinLines(
            footerData.value.exploreLinks || [],
            (item) => `${item.label}|${item.path}`,
          ),
          supportLinksText: joinLines(
            footerData.value.supportLinks || [],
            (item) => `${item.label}|${item.path}`,
          ),
        }));
      }
    } catch (error) {
      console.error('Error fetching content:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key, value, successMessage) => {
    setSavingKey(key);
    try {
      const { error } = await supabase.from('settings').upsert({ key, value });
      if (error) throw error;
      alert(successMessage);
    } catch (error) {
      alert(`Error saving ${key}: ${error.message}`);
    } finally {
      setSavingKey('');
    }
  };

  const handleSaveHero = () =>
    saveSetting('hero_text', heroText, 'Hero content saved successfully.');

  const handleSavePolicies = () =>
    saveSetting('store_policies', policies, 'Policies saved successfully.');

  const handleSaveHomepage = () =>
    saveSetting(
      'homepage_content',
      {
        heroEyebrow: homepageContent.heroEyebrow,
        heroImage: homepageContent.heroImage,
        signatureImage: homepageContent.signatureImage,
        secondaryFeatureImage: homepageContent.secondaryFeatureImage,
        processDesignImage: homepageContent.processDesignImage,
        processMaterialImage: homepageContent.processMaterialImage,
        processCraftImage: homepageContent.processCraftImage,
        processFinishImage: homepageContent.processFinishImage,
        collectionEyebrow: homepageContent.collectionEyebrow,
        collectionHeadline: homepageContent.collectionHeadline,
        collectionSummary: homepageContent.collectionSummary,
        socialEyebrow: homepageContent.socialEyebrow,
        socialHeadline: homepageContent.socialHeadline,
        founderQuote: homepageContent.founderQuote,
        trustItems: parsePipeLines(homepageContent.trustItemsText, ['title', 'body']),
        pressMentions: parseSimpleLines(homepageContent.pressMentionsText),
        testimonials: parsePipeLines(homepageContent.testimonialsText, ['quote', 'author', 'location']),
        socialImages: parseSimpleLines(homepageContent.socialImagesText),
      },
      'Homepage content saved successfully.',
    );

  const handleSaveAbout = () =>
    saveSetting(
      'about_page_content',
      {
        eyebrow: aboutContent.eyebrow,
        title: aboutContent.title,
        introHeadline: aboutContent.introHeadline,
        introBody: aboutContent.introBody,
        storyCards: parsePipeLines(aboutContent.storyCardsText, ['title', 'body']),
        makingOfEyebrow: aboutContent.makingOfEyebrow,
        makingOfHeadline: aboutContent.makingOfHeadline,
        makingOfItems: parsePipeLines(aboutContent.makingOfItemsText, ['img', 'title', 'text']),
      },
      'About page content saved successfully.',
    );

  const handleSaveContact = () =>
    saveSetting(
      'contact_page_content',
      {
        eyebrow: contactContent.eyebrow,
        title: contactContent.title,
        introHeadline: contactContent.introHeadline,
        introBody: contactContent.introBody,
        supportHeading: contactContent.supportHeading,
        supportBody: contactContent.supportBody,
        supportEmail: contactContent.supportEmail,
        studioAddress: contactContent.studioAddress,
        successTitle: contactContent.successTitle,
        successBody: contactContent.successBody,
      },
      'Contact page content saved successfully.',
    );

  const handleSaveFooter = () =>
    saveSetting(
      'footer_content',
      {
        brandCopy: footerContent.brandCopy,
        exploreHeading: footerContent.exploreHeading,
        exploreLinks: parsePipeLines(footerContent.exploreLinksText, ['label', 'path']),
        supportHeading: footerContent.supportHeading,
        supportLinks: parsePipeLines(footerContent.supportLinksText, ['label', 'path']),
        newsletterHeading: footerContent.newsletterHeading,
        newsletterText: footerContent.newsletterText,
      },
      'Footer content saved successfully.',
    );

  const heroProgress = [heroText.headline, heroText.subtext].filter(Boolean).length;
  const homepageProgress = [
    homepageContent.collectionHeadline,
    homepageContent.collectionSummary,
    homepageContent.founderQuote,
    ...parseSimpleLines(homepageContent.trustItemsText),
    ...parseSimpleLines(homepageContent.testimonialsText),
  ].filter(Boolean).length;
  const aboutProgress = [
    aboutContent.title,
    aboutContent.introHeadline,
    ...parseSimpleLines(aboutContent.storyCardsText),
    ...parseSimpleLines(aboutContent.makingOfItemsText),
  ].filter(Boolean).length;
  const contactProgress = [
    contactContent.title,
    contactContent.supportEmail,
    contactContent.supportBody,
    contactContent.studioAddress,
  ].filter(Boolean).length;
  const policyProgress = [
    policies.privacy,
    policies.terms,
    policies.refund,
    policies.shipping,
  ].filter(Boolean).length;
  const footerProgress = [
    footerContent.brandCopy,
    footerContent.exploreHeading,
    footerContent.supportHeading,
    footerContent.newsletterHeading,
    ...parseSimpleLines(footerContent.exploreLinksText),
    ...parseSimpleLines(footerContent.supportLinksText),
  ].filter(Boolean).length;

  const sectionStatuses = {
    hero: { count: heroProgress, total: 2, label: getSectionStatus(heroProgress, 2) },
    homepage: { count: homepageProgress, total: 5, label: getSectionStatus(Math.min(homepageProgress, 5), 5) },
    about: { count: aboutProgress, total: 4, label: getSectionStatus(Math.min(aboutProgress, 4), 4) },
    contact: { count: contactProgress, total: 4, label: getSectionStatus(contactProgress, 4) },
    policies: { count: policyProgress, total: 4, label: getSectionStatus(policyProgress, 4) },
    footer: { count: footerProgress, total: 6, label: getSectionStatus(Math.min(footerProgress, 6), 6) },
  };

  const heroProduct = productLibrary[0] || null;
  const featureProduct = productLibrary[1] || productLibrary[0] || null;
  const makingOfPreviewItems = parsePipeLines(aboutContent.makingOfItemsText, ['img', 'title', 'text']);

  const fallbackHeroImage =
    heroProduct?.gallery?.find((image) => image && image !== heroProduct?.hero) ||
    heroProduct?.hero ||
    '';

  const fallbackFeatureImage =
    featureProduct?.gallery?.find((image) => image && image !== featureProduct?.hero) ||
    featureProduct?.hero ||
    fallbackHeroImage;

  const homepagePreviewImages = {
    heroImage: homepageContent.heroImage || fallbackHeroImage,
    signatureImage: homepageContent.signatureImage || heroProduct?.hero || fallbackHeroImage,
    secondaryFeatureImage: homepageContent.secondaryFeatureImage || fallbackFeatureImage,
    processDesignImage:
      homepageContent.processDesignImage ||
      makingOfPreviewItems[0]?.img ||
      fallbackHeroImage,
    processMaterialImage:
      homepageContent.processMaterialImage ||
      makingOfPreviewItems[1]?.img ||
      fallbackFeatureImage ||
      fallbackHeroImage,
    processCraftImage:
      homepageContent.processCraftImage ||
      makingOfPreviewItems[2]?.img ||
      heroProduct?.hero ||
      fallbackHeroImage,
    processFinishImage:
      homepageContent.processFinishImage ||
      heroProduct?.gallery?.[1] ||
      featureProduct?.gallery?.[1] ||
      featureProduct?.hero ||
      fallbackHeroImage,
  };

  if (loading) return <div>Loading content...</div>;

  return (
    <div className="cms-page">
      <div className="page-header">
        <div>
          <h2>Content CMS</h2>
          <p className="cms-page-subtitle">
            Manage the storefront content that now feeds the customer website with safe fallbacks.
          </p>
        </div>
      </div>

      <div className="cms-page-grid">
        <aside className="card cms-sidebar-card">
          <p className="cms-sidebar-label">Content Areas</p>
          <div className="cms-jump-list">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="cms-jump-link">
                <span>{section.label}</span>
                <span className="cms-jump-meta">{sectionStatuses[section.id].label}</span>
              </a>
            ))}
          </div>
          <div className="cms-sidebar-note">
            Existing product, order, payment, and settings logic stays untouched. These editors only
            control content.
          </div>
        </aside>

        <div className="cms-sections">
          <section className="cms-overview-grid">
            <div className="card cms-overview-card">
              <p className="cms-overview-label">Homepage</p>
              <h3>{sectionStatuses.hero.label}</h3>
              <p>Hero and homepage storytelling blocks are connected to the storefront.</p>
            </div>
            <div className="card cms-overview-card">
              <p className="cms-overview-label">Brand Pages</p>
              <h3>{sectionStatuses.about.label}</h3>
              <p>About and contact content can now be edited without touching code.</p>
            </div>
            <div className="card cms-overview-card">
              <p className="cms-overview-label">Store Support</p>
              <h3>{sectionStatuses.policies.label}</h3>
              <p>Policies and footer link groups stay editable from one place.</p>
            </div>
          </section>

          <section id="hero" className="card cms-card">
            <SectionHeader
              title="Homepage Hero"
              body="Preserves the existing hero save flow, now with the storefront reading it safely."
            />
            <div className="cms-form-grid">
              <div>
                <FieldLabel>Main Headline</FieldLabel>
                <input
                  type="text"
                  value={heroText.headline}
                  onChange={(e) => setHeroText({ ...heroText, headline: e.target.value })}
                  placeholder="e.g. Precision in Every Second"
                />
              </div>
              <div>
                <FieldLabel>Subtext</FieldLabel>
                <textarea
                  value={heroText.subtext}
                  onChange={(e) => setHeroText({ ...heroText, subtext: e.target.value })}
                  rows={3}
                />
              </div>
              <PreviewNote title="Preview">
                <h4>{heroText.headline || 'Your homepage headline will appear here.'}</h4>
                <p>{heroText.subtext || 'Add a short supporting line to guide the tone of the hero section.'}</p>
              </PreviewNote>
              <div className="cms-actions-row">
                <SaveButton
                  onClick={handleSaveHero}
                  disabled={savingKey === 'hero_text'}
                  label={savingKey === 'hero_text' ? 'Saving...' : 'Save Hero'}
                />
              </div>
            </div>
          </section>

          <section id="homepage" className="card cms-card">
            <SectionHeader
              title="Homepage Sections"
              body="Controls homepage supporting sections without changing product logic."
            />
            <div className="cms-form-grid">
              <div className="cms-two-col">
                <div>
                  <FieldLabel>Hero Eyebrow</FieldLabel>
                  <input
                    type="text"
                    value={homepageContent.heroEyebrow}
                    onChange={(e) => setHomepageContent({ ...homepageContent, heroEyebrow: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Collection Eyebrow</FieldLabel>
                  <input
                    type="text"
                    value={homepageContent.collectionEyebrow}
                    onChange={(e) => setHomepageContent({ ...homepageContent, collectionEyebrow: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Homepage Image Slots</FieldLabel>
                <FieldHint>
                  These images are used only on the homepage, so you can upload cleaner transparent or campaign-specific visuals without reusing product gallery assets.
                </FieldHint>
              </div>

              <div className="cms-image-grid">
                <ImageSlotField
                  label="Hero Product Image"
                  value={homepageContent.heroImage}
                  previewValue={homepagePreviewImages.heroImage}
                  onChange={(value) => setHomepageContent({ ...homepageContent, heroImage: value })}
                  hint="Used in the main hero section under the headline."
                />
                <ImageSlotField
                  label="Signature Feature Image"
                  value={homepageContent.signatureImage}
                  previewValue={homepagePreviewImages.signatureImage}
                  onChange={(value) => setHomepageContent({ ...homepageContent, signatureImage: value })}
                  hint="Used in the first feature section: The Chronyx Core."
                />
                <ImageSlotField
                  label="Secondary Feature Image"
                  value={homepageContent.secondaryFeatureImage}
                  previewValue={homepagePreviewImages.secondaryFeatureImage}
                  onChange={(value) => setHomepageContent({ ...homepageContent, secondaryFeatureImage: value })}
                  hint="Used in the second product feature section."
                />
                <ImageSlotField
                  label="Process: Design Image"
                  value={homepageContent.processDesignImage}
                  previewValue={homepagePreviewImages.processDesignImage}
                  onChange={(value) => setHomepageContent({ ...homepageContent, processDesignImage: value })}
                  hint="Shown when the Design step is active."
                />
                <ImageSlotField
                  label="Process: Material Image"
                  value={homepageContent.processMaterialImage}
                  previewValue={homepagePreviewImages.processMaterialImage}
                  onChange={(value) => setHomepageContent({ ...homepageContent, processMaterialImage: value })}
                  hint="Shown when the Material step is active."
                />
                <ImageSlotField
                  label="Process: Craft Image"
                  value={homepageContent.processCraftImage}
                  previewValue={homepagePreviewImages.processCraftImage}
                  onChange={(value) => setHomepageContent({ ...homepageContent, processCraftImage: value })}
                  hint="Shown when the Craft step is active."
                />
                <ImageSlotField
                  label="Process: Finish Image"
                  value={homepageContent.processFinishImage}
                  previewValue={homepagePreviewImages.processFinishImage}
                  onChange={(value) => setHomepageContent({ ...homepageContent, processFinishImage: value })}
                  hint="Shown when the Finish step is active."
                />
              </div>

              <div>
                <FieldLabel>Collection Headline</FieldLabel>
                <input
                  type="text"
                  value={homepageContent.collectionHeadline}
                  onChange={(e) => setHomepageContent({ ...homepageContent, collectionHeadline: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>Collection Summary</FieldLabel>
                <textarea
                  rows={3}
                  value={homepageContent.collectionSummary}
                  onChange={(e) => setHomepageContent({ ...homepageContent, collectionSummary: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>Founder Quote</FieldLabel>
                <textarea
                  rows={3}
                  value={homepageContent.founderQuote}
                  onChange={(e) => setHomepageContent({ ...homepageContent, founderQuote: e.target.value })}
                />
              </div>

              <div className="cms-two-col">
                <div>
                  <FieldLabel>Social Section Eyebrow</FieldLabel>
                  <input
                    type="text"
                    value={homepageContent.socialEyebrow}
                    onChange={(e) => setHomepageContent({ ...homepageContent, socialEyebrow: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Social Section Headline</FieldLabel>
                  <input
                    type="text"
                    value={homepageContent.socialHeadline}
                    onChange={(e) => setHomepageContent({ ...homepageContent, socialHeadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Trust Items</FieldLabel>
                <textarea
                  rows={4}
                  value={homepageContent.trustItemsText}
                  onChange={(e) => setHomepageContent({ ...homepageContent, trustItemsText: e.target.value })}
                  placeholder="Insured delivery|White-glove packaging and tracked dispatch."
                />
                <FieldHint>One item per line: `Title|Body`</FieldHint>
              </div>

              <div>
                <FieldLabel>Press Mentions</FieldLabel>
                <textarea
                  rows={4}
                  value={homepageContent.pressMentionsText}
                  onChange={(e) => setHomepageContent({ ...homepageContent, pressMentionsText: e.target.value })}
                  placeholder="Architectural Digest"
                />
                <FieldHint>One publication name per line.</FieldHint>
              </div>

              <div>
                <FieldLabel>Testimonials</FieldLabel>
                <textarea
                  rows={6}
                  value={homepageContent.testimonialsText}
                  onChange={(e) => setHomepageContent({ ...homepageContent, testimonialsText: e.target.value })}
                  placeholder="A beautiful statement piece.|James M.|Mumbai"
                />
                <FieldHint>One testimonial per line: `Quote|Author|Location`</FieldHint>
              </div>

              <div>
                <FieldLabel>Social Gallery Images</FieldLabel>
                <textarea
                  rows={5}
                  value={homepageContent.socialImagesText}
                  onChange={(e) => setHomepageContent({ ...homepageContent, socialImagesText: e.target.value })}
                  placeholder="https://..."
                />
                <FieldHint>One image URL per line.</FieldHint>
              </div>

              <PreviewNote title="What this controls">
                <ul className="cms-preview-list">
                  <li>{homepageContent.collectionHeadline || 'Collection headline not set yet.'}</li>
                  <li>{homepageContent.founderQuote || 'Founder quote not set yet.'}</li>
                  <li>
                    {[
                      homepageContent.heroImage,
                      homepageContent.signatureImage,
                      homepageContent.secondaryFeatureImage,
                      homepageContent.processDesignImage,
                      homepageContent.processMaterialImage,
                      homepageContent.processCraftImage,
                      homepageContent.processFinishImage,
                    ].filter(Boolean).length} homepage image slot(s) filled
                  </li>
                  <li>{parseSimpleLines(homepageContent.trustItemsText).length} trust item(s)</li>
                  <li>{parseSimpleLines(homepageContent.testimonialsText).length} testimonial(s)</li>
                  <li>{parseSimpleLines(homepageContent.socialImagesText).length} social image URL(s)</li>
                </ul>
              </PreviewNote>

              <div className="cms-actions-row">
                <SaveButton
                  onClick={handleSaveHomepage}
                  disabled={savingKey === 'homepage_content'}
                  label={savingKey === 'homepage_content' ? 'Saving...' : 'Save Homepage Sections'}
                />
              </div>
            </div>
          </section>

          <section id="about" className="card cms-card">
            <SectionHeader
              title="About Page"
              body="Controls the about page story, values, and making-of section."
            />
            <div className="cms-form-grid">
              <div className="cms-two-col">
                <div>
                  <FieldLabel>Page Eyebrow</FieldLabel>
                  <input
                    type="text"
                    value={aboutContent.eyebrow}
                    onChange={(e) => setAboutContent({ ...aboutContent, eyebrow: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Page Title</FieldLabel>
                  <input
                    type="text"
                    value={aboutContent.title}
                    onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Intro Headline</FieldLabel>
                <input
                  type="text"
                  value={aboutContent.introHeadline}
                  onChange={(e) => setAboutContent({ ...aboutContent, introHeadline: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>Intro Body</FieldLabel>
                <textarea
                  rows={4}
                  value={aboutContent.introBody}
                  onChange={(e) => setAboutContent({ ...aboutContent, introBody: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>Story Cards</FieldLabel>
                <textarea
                  rows={5}
                  value={aboutContent.storyCardsText}
                  onChange={(e) => setAboutContent({ ...aboutContent, storyCardsText: e.target.value })}
                  placeholder="Our Materials|We source only the finest hardwoods."
                />
                <FieldHint>One card per line: `Title|Body`</FieldHint>
              </div>

              <div className="cms-two-col">
                <div>
                  <FieldLabel>Making-of Eyebrow</FieldLabel>
                  <input
                    type="text"
                    value={aboutContent.makingOfEyebrow}
                    onChange={(e) => setAboutContent({ ...aboutContent, makingOfEyebrow: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Making-of Headline</FieldLabel>
                  <input
                    type="text"
                    value={aboutContent.makingOfHeadline}
                    onChange={(e) => setAboutContent({ ...aboutContent, makingOfHeadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Making-of Cards</FieldLabel>
                <textarea
                  rows={6}
                  value={aboutContent.makingOfItemsText}
                  onChange={(e) => setAboutContent({ ...aboutContent, makingOfItemsText: e.target.value })}
                  placeholder="https://image-url|Sourcing the Timber|We work directly with sustainable mills."
                />
                <FieldHint>One card per line: `Image URL|Title|Body`</FieldHint>
              </div>

              <PreviewNote title="About page snapshot">
                <ul className="cms-preview-list">
                  <li>{aboutContent.title || 'Page title not set yet.'}</li>
                  <li>{aboutContent.introHeadline || 'Intro headline not set yet.'}</li>
                  <li>{parseSimpleLines(aboutContent.storyCardsText).length} story card(s)</li>
                  <li>{parseSimpleLines(aboutContent.makingOfItemsText).length} making-of card(s)</li>
                </ul>
              </PreviewNote>

              <div className="cms-actions-row">
                <SaveButton
                  onClick={handleSaveAbout}
                  disabled={savingKey === 'about_page_content'}
                  label={savingKey === 'about_page_content' ? 'Saving...' : 'Save About Page'}
                />
              </div>
            </div>
          </section>

          <section id="contact" className="card cms-card">
            <SectionHeader
              title="Contact Page"
              body="Manages support copy, support email, address, and success messaging."
            />
            <div className="cms-form-grid">
              <div className="cms-two-col">
                <div>
                  <FieldLabel>Page Eyebrow</FieldLabel>
                  <input
                    type="text"
                    value={contactContent.eyebrow}
                    onChange={(e) => setContactContent({ ...contactContent, eyebrow: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Page Title</FieldLabel>
                  <input
                    type="text"
                    value={contactContent.title}
                    onChange={(e) => setContactContent({ ...contactContent, title: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Intro Headline</FieldLabel>
                <input
                  type="text"
                  value={contactContent.introHeadline}
                  onChange={(e) => setContactContent({ ...contactContent, introHeadline: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>Intro Body</FieldLabel>
                <textarea
                  rows={3}
                  value={contactContent.introBody}
                  onChange={(e) => setContactContent({ ...contactContent, introBody: e.target.value })}
                />
              </div>

              <div className="cms-two-col">
                <div>
                  <FieldLabel>Support Heading</FieldLabel>
                  <input
                    type="text"
                    value={contactContent.supportHeading}
                    onChange={(e) => setContactContent({ ...contactContent, supportHeading: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Support Email</FieldLabel>
                  <input
                    type="email"
                    value={contactContent.supportEmail}
                    onChange={(e) => setContactContent({ ...contactContent, supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Support Body</FieldLabel>
                <textarea
                  rows={3}
                  value={contactContent.supportBody}
                  onChange={(e) => setContactContent({ ...contactContent, supportBody: e.target.value })}
                />
              </div>

              <div>
                <FieldLabel>Studio Address</FieldLabel>
                <textarea
                  rows={4}
                  value={contactContent.studioAddress}
                  onChange={(e) => setContactContent({ ...contactContent, studioAddress: e.target.value })}
                />
                <FieldHint>One address line per row.</FieldHint>
              </div>

              <div className="cms-two-col">
                <div>
                  <FieldLabel>Success Title</FieldLabel>
                  <input
                    type="text"
                    value={contactContent.successTitle}
                    onChange={(e) => setContactContent({ ...contactContent, successTitle: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Success Body</FieldLabel>
                  <input
                    type="text"
                    value={contactContent.successBody}
                    onChange={(e) => setContactContent({ ...contactContent, successBody: e.target.value })}
                  />
                </div>
              </div>

              <PreviewNote title="Customer contact details">
                <ul className="cms-preview-list">
                  <li>{contactContent.supportEmail || 'Support email not set yet.'}</li>
                  <li>{contactContent.supportHeading || 'Support heading not set yet.'}</li>
                  <li>{contactContent.successTitle || 'Success title not set yet.'}</li>
                </ul>
              </PreviewNote>

              <div className="cms-actions-row">
                <SaveButton
                  onClick={handleSaveContact}
                  disabled={savingKey === 'contact_page_content'}
                  label={savingKey === 'contact_page_content' ? 'Saving...' : 'Save Contact Page'}
                />
              </div>
            </div>
          </section>

          <section id="policies" className="card cms-card">
            <SectionHeader
              title="Store Policies"
              body="Preserves the existing policy save flow and adds a refund field now used by the storefront."
            />
            <div className="cms-form-grid">
              <div>
                <FieldLabel>Privacy Policy</FieldLabel>
                <textarea
                  value={policies.privacy || ''}
                  onChange={(e) => setPolicies({ ...policies, privacy: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <FieldLabel>Terms &amp; Conditions</FieldLabel>
                <textarea
                  value={policies.terms || ''}
                  onChange={(e) => setPolicies({ ...policies, terms: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <FieldLabel>Refund &amp; Return Policy</FieldLabel>
                <textarea
                  value={policies.refund || ''}
                  onChange={(e) => setPolicies({ ...policies, refund: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <FieldLabel>Shipping Policy</FieldLabel>
                <textarea
                  value={policies.shipping || ''}
                  onChange={(e) => setPolicies({ ...policies, shipping: e.target.value })}
                  rows={5}
                />
              </div>
              <PreviewNote title="Policy coverage">
                <ul className="cms-preview-list">
                  <li>{policies.privacy ? 'Privacy policy added' : 'Privacy policy missing'}</li>
                  <li>{policies.terms ? 'Terms added' : 'Terms missing'}</li>
                  <li>{policies.refund ? 'Refund policy added' : 'Refund policy missing'}</li>
                  <li>{policies.shipping ? 'Shipping policy added' : 'Shipping policy missing'}</li>
                </ul>
              </PreviewNote>
              <div className="cms-actions-row">
                <SaveButton
                  onClick={handleSavePolicies}
                  disabled={savingKey === 'store_policies'}
                  label={savingKey === 'store_policies' ? 'Saving...' : 'Save Policies'}
                />
              </div>
            </div>
          </section>

          <section id="footer" className="card cms-card">
            <SectionHeader
              title="Footer"
              body="Controls footer copy and link groups without changing routing logic."
            />
            <div className="cms-form-grid">
              <div>
                <FieldLabel>Brand Copy</FieldLabel>
                <textarea
                  rows={3}
                  value={footerContent.brandCopy}
                  onChange={(e) => setFooterContent({ ...footerContent, brandCopy: e.target.value })}
                />
              </div>

              <div className="cms-two-col">
                <div>
                  <FieldLabel>Explore Heading</FieldLabel>
                  <input
                    type="text"
                    value={footerContent.exploreHeading}
                    onChange={(e) => setFooterContent({ ...footerContent, exploreHeading: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Support Heading</FieldLabel>
                  <input
                    type="text"
                    value={footerContent.supportHeading}
                    onChange={(e) => setFooterContent({ ...footerContent, supportHeading: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Explore Links</FieldLabel>
                <textarea
                  rows={4}
                  value={footerContent.exploreLinksText}
                  onChange={(e) => setFooterContent({ ...footerContent, exploreLinksText: e.target.value })}
                  placeholder="Shop All|/shop"
                />
                <FieldHint>One link per line: `Label|Path`</FieldHint>
              </div>

              <div>
                <FieldLabel>Support Links</FieldLabel>
                <textarea
                  rows={4}
                  value={footerContent.supportLinksText}
                  onChange={(e) => setFooterContent({ ...footerContent, supportLinksText: e.target.value })}
                  placeholder="Privacy & Policies|/policies"
                />
                <FieldHint>One link per line: `Label|Path`</FieldHint>
              </div>

              <div className="cms-two-col">
                <div>
                  <FieldLabel>Newsletter Heading</FieldLabel>
                  <input
                    type="text"
                    value={footerContent.newsletterHeading}
                    onChange={(e) => setFooterContent({ ...footerContent, newsletterHeading: e.target.value })}
                  />
                </div>
                <div>
                  <FieldLabel>Newsletter Copy</FieldLabel>
                  <input
                    type="text"
                    value={footerContent.newsletterText}
                    onChange={(e) => setFooterContent({ ...footerContent, newsletterText: e.target.value })}
                  />
                </div>
              </div>

              <PreviewNote title="Footer snapshot">
                <ul className="cms-preview-list">
                  <li>{footerContent.exploreHeading || 'Explore heading not set yet.'}</li>
                  <li>{footerContent.supportHeading || 'Support heading not set yet.'}</li>
                  <li>{parseSimpleLines(footerContent.exploreLinksText).length} explore link(s)</li>
                  <li>{parseSimpleLines(footerContent.supportLinksText).length} support link(s)</li>
                </ul>
              </PreviewNote>

              <div className="cms-actions-row">
                <SaveButton
                  onClick={handleSaveFooter}
                  disabled={savingKey === 'footer_content'}
                  label={savingKey === 'footer_content' ? 'Saving...' : 'Save Footer'}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Content;
