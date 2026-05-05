import { describe, expect, it } from 'vitest';
import {
  buildAbsoluteUrl,
  buildProductSchema,
  buildProductVideoAsset,
  buildVideoSitemapXml,
  getVimeoVideoId,
  getYoutubeVideoId,
  normalizeEmbedUrl,
  secondsToIsoDuration,
  stripHtml,
} from '../lib/structuredData';

describe('structured data helpers', () => {
  it('normalizes URLs, text, and video durations', () => {
    expect(buildAbsoluteUrl('/shop')).toBe('https://chronyx.in/shop');
    expect(stripHtml('<p>Hello <strong>CHRONYX</strong></p>')).toBe('Hello CHRONYX');
    expect(secondsToIsoDuration(3661)).toBe('PT1H1M1S');
    expect(secondsToIsoDuration(0)).toBeNull();
  });

  it('extracts and normalizes supported video embeds', () => {
    expect(getYoutubeVideoId('https://www.youtube.com/watch?v=abc123XYZ')).toBe('abc123XYZ');
    expect(getVimeoVideoId('https://vimeo.com/123456')).toBe('123456');
    expect(normalizeEmbedUrl('https://youtu.be/abc123XYZ')).toBe('https://www.youtube.com/embed/abc123XYZ');
    expect(normalizeEmbedUrl('https://vimeo.com/123456')).toBe('https://player.vimeo.com/video/123456');
  });

  it('builds product schema with review aggregate only when reviews exist', () => {
    const product = {
      id: 'walnut-orbit',
      name: 'Walnut Orbit',
      gallery: ['hero.jpg', null],
      summary: '<b>Quiet clock</b>',
      price: 12000,
      stockQuantity: 3,
    };

    const schema = buildProductSchema(product, { count: 2, avg: 4.5 });

    expect(schema.offers.availability).toBe('https://schema.org/InStock');
    expect(schema.description).toBe('Quiet clock');
    expect(schema.aggregateRating).toMatchObject({ ratingValue: 4.5, reviewCount: 2 });
  });

  it('escapes XML-sensitive video sitemap fields', () => {
    const xml = buildVideoSitemapXml([
      {
        id: 'clock-1',
        name: 'Clock & <Time>',
        hero: 'https://example.test/thumb.jpg',
        video_url: 'https://example.test/video.mp4',
        video_title: 'Clock & <Time>',
        video_description: 'A "quoted" clock & more',
        video_duration_seconds: 95,
        created_at: '2026-01-02T03:04:05.000Z',
      },
    ]);

    expect(xml).toContain('Clock &amp; &lt;Time&gt;');
    expect(xml).toContain('A &quot;quoted&quot; clock &amp; more');
    expect(xml).toContain('<video:duration>95</video:duration>');
  });

  it('builds product video assets from mixed product fields', () => {
    const video = buildProductVideoAsset({
      id: 'clock-1',
      name: 'Clock One',
      summary: '<p>Summary</p>',
      hero: 'fallback.jpg',
      videoEmbed: 'https://youtu.be/abc123XYZ',
      video_duration_seconds: '120',
      created_at: '2026-01-02T03:04:05.000Z',
    });

    expect(video.embedUrl).toBe('https://www.youtube.com/embed/abc123XYZ');
    expect(video.thumbnailUrl).toBe('https://i.ytimg.com/vi/abc123XYZ/maxresdefault.jpg');
    expect(video.durationIso).toBe('PT2M');
    expect(video.description).toBe('Summary');
  });
});
