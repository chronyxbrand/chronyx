import { useEffect } from 'react';

export default function SEO({ title, description, schema }) {
  useEffect(() => {
    // Update title
    document.title = title ? `${title} | CHRONYX` : 'CHRONYX | Luxury Wall Clocks';

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || 'Precision-crafted wooden wall clocks blending modern minimalist design with timeless materials.';

    // Manage Schema Markup
    const existingSchema = document.getElementById('schema-markup');
    if (existingSchema) {
      existingSchema.remove();
    }

    if (schema) {
      const script = document.createElement('script');
      script.id = 'schema-markup';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }

    // Cleanup on unmount (optional, but good practice for SPA)
    return () => {
      const existingSchema = document.getElementById('schema-markup');
      if (existingSchema) {
        existingSchema.remove();
      }
    };
  }, [title, description, schema]);

  return null;
}
