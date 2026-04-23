// Design styles + home types we generate SEO pages for.
// Each (city × style) combination becomes a landing page.
// 30 cities × 20 styles = 600 landing pages from this file alone.

export const ARCHITECTURE_STYLES = [
  { slug: 'modern',               name: 'Modern',               intent: 'architect' },
  { slug: 'contemporary',         name: 'Contemporary',         intent: 'architect' },
  { slug: 'traditional',          name: 'Traditional Indian',   intent: 'architect' },
  { slug: 'minimalist',           name: 'Minimalist',           intent: 'architect' },
  { slug: 'kerala-nalukettu',     name: 'Kerala Nalukettu',     intent: 'architect' },
  { slug: 'rajasthani-haveli',    name: 'Rajasthani Haveli',    intent: 'architect' },
  { slug: 'goan-portuguese',      name: 'Goan Portuguese',      intent: 'architect' },
  { slug: 'south-indian',         name: 'South Indian Heritage', intent: 'architect' },
  { slug: 'vastu-compliant',      name: 'Vastu-Compliant',      intent: 'architect' },
  { slug: 'farmhouse',            name: 'Farmhouse',            intent: 'architect' },
  { slug: 'villa',                name: 'Luxury Villa',         intent: 'architect' },
  { slug: '2bhk',                 name: '2BHK',                 intent: 'architect' },
  { slug: '3bhk',                 name: '3BHK',                 intent: 'architect' },
  { slug: '4bhk',                 name: '4BHK',                 intent: 'architect' },
  { slug: 'duplex',               name: 'Duplex',               intent: 'architect' },
];

export const INTERIOR_CATEGORIES = [
  { slug: 'modular-kitchen',      name: 'Modular Kitchen',      intent: 'interior-designer' },
  { slug: 'living-room',          name: 'Living Room',          intent: 'interior-designer' },
  { slug: 'bedroom',              name: 'Bedroom',              intent: 'interior-designer' },
  { slug: 'bathroom',             name: 'Bathroom',             intent: 'interior-designer' },
  { slug: 'pooja-room',           name: 'Pooja Room',           intent: 'interior-designer' },
  { slug: 'home-office',          name: 'Home Office',          intent: 'interior-designer' },
  { slug: 'full-home',            name: 'Full Home Interior',   intent: 'interior-designer' },
  { slug: 'budget-friendly',      name: 'Budget-Friendly',      intent: 'interior-designer' },
  { slug: 'luxury',               name: 'Luxury',               intent: 'interior-designer' },
  { slug: 'vastu-compliant',      name: 'Vastu-Compliant',      intent: 'interior-designer' },
];

export function findStyle(slug) {
  return ARCHITECTURE_STYLES.find(s => s.slug === slug.toLowerCase())
      || INTERIOR_CATEGORIES.find(s => s.slug === slug.toLowerCase())
      || null;
}
