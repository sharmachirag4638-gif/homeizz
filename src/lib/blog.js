// Central blog index. Posts with full content live in src/content/blog/<slug>.js
// Each content file exports { meta, default: BodyComponent }.
// Stub posts (no body yet) live here directly until written.

import * as costIndia from '@/content/blog/interior-design-cost-india';

// Posts that have full bodies — listed first so they appear at the top of /blog
const FULL_POSTS = [
  { ...costIndia.meta, Body: costIndia.default },
];

// Stubs — will be replaced with full content soon. Keep their slugs stable so
// any backlinks already submitted continue to work.
const STUB_POSTS = [
  {
    slug: 'top-interior-designers-mumbai',
    title: 'Top 10 Interior Designers in Mumbai 2026',
    excerpt: 'Discover the most talented and highly-rated interior designers in Mumbai. Compare portfolios and find the perfect match for your home.',
    category: 'City Guide',
    time: '5 min read',
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80',
    publishedAt: '2026-04-29',
    keywords: ['top interior designers mumbai', 'best interior designers mumbai', 'mumbai interior designers'],
    Body: null, // not yet written
  },
  {
    slug: 'top-architects-bangalore',
    title: 'Best Architects in Bangalore: A Complete 2026 Guide',
    excerpt: 'Looking for an architect in Bangalore? Here are the top firms and independent architects known for their exceptional work.',
    category: 'City Guide',
    time: '6 min read',
    img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1600&q=80',
    publishedAt: '2026-04-29',
    keywords: ['best architects bangalore', 'architects in bangalore', 'top architects bangalore'],
    Body: null,
  },
  {
    slug: 'modern-vs-minimalist',
    title: 'Modern vs Minimalist: Which Interior Style is Right for You?',
    excerpt: 'Confused between modern and minimalist design? We break down the key differences to help you choose the right style for your home.',
    category: 'Design Guide',
    time: '7 min read',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    publishedAt: '2026-04-29',
    keywords: ['modern vs minimalist', 'minimalist vs modern', 'interior design styles'],
    Body: null,
  },
  {
    slug: 'vastu-shastra-modern-homes',
    title: 'Vastu Shastra for Modern Homes: A Practical Guide',
    excerpt: 'How to incorporate Vastu principles in your modern home design without compromising on aesthetics.',
    category: 'Tips',
    time: '6 min read',
    img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1600&q=80',
    publishedAt: '2026-04-29',
    keywords: ['vastu modern home', 'vastu shastra', 'vastu compliant home'],
    Body: null,
  },
  {
    slug: 'questions-ask-interior-designer',
    title: '10 Questions to Ask Your Interior Designer Before Hiring',
    excerpt: 'Make sure you are making the right choice. These key questions will help you find the perfect designer.',
    category: 'Tips',
    time: '4 min read',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80',
    publishedAt: '2026-04-29',
    keywords: ['questions to ask interior designer', 'hiring interior designer', 'interior designer interview'],
    Body: null,
  },
];

export const POSTS = [...FULL_POSTS, ...STUB_POSTS];

export function getPost(slug) {
  return POSTS.find(p => p.slug === slug) || null;
}

export function getRelatedPosts(slug, limit = 3) {
  const post = getPost(slug);
  if (!post) return [];
  // Prefer explicitly-listed related posts; fall back to same category, then anything else.
  if (post.related?.length) {
    const explicit = post.related.map(s => getPost(s)).filter(Boolean);
    if (explicit.length >= limit) return explicit.slice(0, limit);
  }
  const sameCategory = POSTS.filter(p => p.slug !== slug && p.category === post.category);
  const others = POSTS.filter(p => p.slug !== slug && p.category !== post.category);
  return [...sameCategory, ...others].slice(0, limit);
}
