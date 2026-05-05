import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// If structuredData exists in a format we can import, we'll try to import it, but we can also just implement simple XML builder here.
// To keep the script standalone and robust against client-side imports breaking in Node, we implement builders here.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

const SITE_URL = 'https://chronyx.in';

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function loadEnv() {
  try {
    const contents = await fs.readFile(envPath, 'utf8');
    return Object.fromEntries(
      contents
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const separatorIndex = line.indexOf('=');
          const key = line.slice(0, separatorIndex).trim();
          const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
          return [key, value];
        }),
    );
  } catch {
    return {};
  }
}

async function fetchSitemapData() {
  const env = await loadEnv();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Skipping dynamic sitemap fetch because Supabase env vars are missing.');
    return { products: [], blogPosts: [], collections: [] };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data: productsData } = await supabase
    .from('products')
    .select('*')
    .eq('is_live', true);

  const { data: blogData } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('is_published', true);

  const { data: collectionsData } = await supabase
    .from('collections')
    .select('slug, updated_at')
    .eq('is_visible', true);

  return {
    products: productsData || [],
    blogPosts: blogData || [],
    collections: collectionsData || [],
  };
}

function buildMainSitemap(products, blogPosts, collections) {
  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/shop', priority: '0.8', changefreq: 'daily' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/policies', priority: '0.3', changefreq: 'yearly' },
    { path: '/guides/wall-clock-placement', priority: '0.6', changefreq: 'yearly' },
    { path: '/blog', priority: '0.7', changefreq: 'weekly' },
    { path: '/locations/mumbai', priority: '0.5', changefreq: 'monthly' },
    { path: '/locations/delhi', priority: '0.5', changefreq: 'monthly' },
    { path: '/locations/bangalore', priority: '0.5', changefreq: 'monthly' },
    { path: '/locations/hyderabad', priority: '0.5', changefreq: 'monthly' },
    { path: '/locations/pune', priority: '0.5', changefreq: 'monthly' },
    { path: '/locations/chennai', priority: '0.5', changefreq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const route of staticRoutes) {
    xml += `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
  }

  for (const collection of (collections || [])) {
    xml += `  <url>
    <loc>${SITE_URL}/collections/${escapeXml(collection.slug)}</loc>
    <lastmod>${new Date(collection.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>
  </url>\n`;
  }

  for (const product of products) {
    xml += `  <url>
    <loc>${SITE_URL}/products/${product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  }

  for (const post of blogPosts) {
    xml += `  <url>
    <loc>${SITE_URL}/journal/${escapeXml(post.slug)}</loc>
    <lastmod>${new Date(post.updated_at || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

function buildVideoSitemap(products) {
  const videoEntries = products.filter(p => p.video_url || p.video_embed_url);
  
  if (videoEntries.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"></urlset>\n`;
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n`;

  for (const product of videoEntries) {
    const loc = `${SITE_URL}/products/${product.id}`;
    const title = product.video_title || `${product.name} video`;
    const description = product.video_description || product.summary || `${product.name} by CHRONYX`;
    const contentLoc = product.video_url;
    const playerLoc = product.video_embed_url;
    const thumbnailLoc = product.video_thumbnail_url || '';

    xml += `  <url>
    <loc>${escapeXml(loc)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailLoc)}</video:thumbnail_loc>
      <video:title>${escapeXml(title)}</video:title>
      <video:description>${escapeXml(description)}</video:description>
${contentLoc ? `      <video:content_loc>${escapeXml(contentLoc)}</video:content_loc>\n` : ''}${playerLoc ? `      <video:player_loc>${escapeXml(playerLoc)}</video:player_loc>\n` : ''}      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>\n`;
  }
  
  xml += `</urlset>\n`;
  return xml;
}

async function run() {
  try {
    const { products, blogPosts, collections } = await fetchSitemapData();
    
    const sitemapXml = buildMainSitemap(products, blogPosts, collections);
    await fs.writeFile(path.join(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf8');
    
    const videoSitemapXml = buildVideoSitemap(products);
    await fs.writeFile(path.join(rootDir, 'public', 'video-sitemap.xml'), videoSitemapXml, 'utf8');
    
    console.log(`Successfully generated sitemaps: ${products.length} products, ${collections.length} collections, ${blogPosts.length} posts.`);
  } catch (error) {
    console.error('Failed to generate sitemaps:', error);
  }
}

run();
