export const fallbackArticles = [
  {
    id: 'fallback-1',
    slug: 'the-art-of-silent-sweeps',
    title: 'The Art of Silent Sweeps',
    excerpt: 'Why the mechanism inside your clock matters just as much as the wood outside.',
    content:
      'A silent sweep movement changes the feeling of a room. Instead of a sharp ticking rhythm, it gives you a calmer sense of time.\n\nFor CHRONYX, that quiet movement matters because our pieces are designed to feel sculptural and restful, not mechanical in an intrusive way.\n\nThe result is a clock that complements a room instead of competing with it.',
    cover_image: '',
    seo_title: 'The Art of Silent Sweeps | CHRONYX Journal',
    seo_description: 'Why silent sweep clock movements create a calmer and more refined interior experience.',
    is_published: true,
    is_featured: true,
    published_at: '2026-04-20T09:00:00.000Z',
  },
  {
    id: 'fallback-2',
    slug: 'walnut-vs-maple-choosing-your-finish',
    title: 'Walnut vs. Maple: Choosing Your Finish',
    excerpt: 'A deep dive into the hardwoods we use and how they age over time.',
    content:
      'Walnut offers depth, contrast, and a more architectural warmth. Maple brings brightness and softness into quieter interiors.\n\nBoth woods age beautifully, but they shape a space differently. The choice depends on whether you want the clock to feel grounded and dramatic or light and serene.',
    cover_image: '',
    seo_title: 'Walnut vs. Maple | CHRONYX Journal',
    seo_description: 'How CHRONYX chooses hardwood finishes and what each material brings to a room.',
    is_published: true,
    is_featured: false,
    published_at: '2026-03-15T09:00:00.000Z',
  },
  {
    id: 'fallback-3',
    slug: 'minimalism-in-interior-design',
    title: 'Minimalism in Interior Design',
    excerpt: 'How a single piece can redefine the warmth of an entire room.',
    content:
      'Minimalism is not about emptiness. It is about choosing fewer objects that carry more presence.\n\nA well-made clock can act as a visual anchor, especially when material and proportion are handled with restraint. That is where craftsmanship becomes part of the atmosphere of a home.',
    cover_image: '',
    seo_title: 'Minimalism in Interior Design | CHRONYX Journal',
    seo_description: 'How one carefully made wooden clock can reshape the mood of an interior.',
    is_published: true,
    is_featured: false,
    published_at: '2026-02-28T09:00:00.000Z',
  },
];

export function formatArticleDate(value) {
  if (!value) return 'Unscheduled';
  return new Date(value).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function findFallbackArticle(slug) {
  return fallbackArticles.find((article) => article.slug === slug) || null;
}
