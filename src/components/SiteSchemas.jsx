import { useEffect } from 'react';
import { buildOrganizationSchema, buildWebsiteSchema } from '../lib/structuredData';

const GLOBAL_SCHEMA_ID = 'chronyx-global-schema';

export default function SiteSchemas() {
  useEffect(() => {
    const existing = document.getElementById(GLOBAL_SCHEMA_ID);
    if (existing) return undefined;

    const script = document.createElement('script');
    script.id = GLOBAL_SCHEMA_ID;
    script.type = 'application/ld+json';
    script.text = JSON.stringify([buildOrganizationSchema(), buildWebsiteSchema()]);
    document.head.appendChild(script);

    return undefined;
  }, []);

  return null;
}
