// Cities we generate programmatic SEO landing pages for.
// Add more as you expand coverage. Each entry drives URLs like:
//   /architects/bangalore/modern
//   /interior-designer/pune/3bhk
// Keep slugs lowercase + hyphenated. `state` helps local SEO schema.

export const CITIES = [
  // Tier 1
  { slug: 'bangalore',  name: 'Bangalore',  state: 'Karnataka',      tier: 1 },
  { slug: 'mumbai',     name: 'Mumbai',     state: 'Maharashtra',    tier: 1 },
  { slug: 'delhi',      name: 'Delhi',      state: 'Delhi',          tier: 1 },
  { slug: 'hyderabad',  name: 'Hyderabad',  state: 'Telangana',      tier: 1 },
  { slug: 'chennai',    name: 'Chennai',    state: 'Tamil Nadu',     tier: 1 },
  { slug: 'kolkata',    name: 'Kolkata',    state: 'West Bengal',    tier: 1 },
  { slug: 'pune',       name: 'Pune',       state: 'Maharashtra',    tier: 1 },
  { slug: 'ahmedabad',  name: 'Ahmedabad',  state: 'Gujarat',        tier: 1 },
  { slug: 'gurgaon',    name: 'Gurgaon',    state: 'Haryana',        tier: 1 },
  { slug: 'noida',      name: 'Noida',      state: 'Uttar Pradesh',  tier: 1 },

  // Tier 2 (where Livspace is weak — go hard here)
  { slug: 'jaipur',      name: 'Jaipur',      state: 'Rajasthan',       tier: 2 },
  { slug: 'lucknow',     name: 'Lucknow',     state: 'Uttar Pradesh',   tier: 2 },
  { slug: 'chandigarh',  name: 'Chandigarh',  state: 'Chandigarh',      tier: 2 },
  { slug: 'kochi',       name: 'Kochi',       state: 'Kerala',          tier: 2 },
  { slug: 'indore',      name: 'Indore',      state: 'Madhya Pradesh',  tier: 2 },
  { slug: 'bhopal',      name: 'Bhopal',      state: 'Madhya Pradesh',  tier: 2 },
  { slug: 'coimbatore',  name: 'Coimbatore',  state: 'Tamil Nadu',      tier: 2 },
  { slug: 'nagpur',      name: 'Nagpur',      state: 'Maharashtra',     tier: 2 },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', tier: 2 },
  { slug: 'nashik',      name: 'Nashik',      state: 'Maharashtra',     tier: 2 },
  { slug: 'surat',       name: 'Surat',       state: 'Gujarat',         tier: 2 },
  { slug: 'vadodara',    name: 'Vadodara',    state: 'Gujarat',         tier: 2 },
  { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', tier: 2 },
  { slug: 'patna',       name: 'Patna',       state: 'Bihar',           tier: 2 },
  { slug: 'ranchi',      name: 'Ranchi',      state: 'Jharkhand',       tier: 2 },
  { slug: 'guwahati',    name: 'Guwahati',    state: 'Assam',           tier: 2 },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha',          tier: 2 },
  { slug: 'dehradun',    name: 'Dehradun',    state: 'Uttarakhand',     tier: 2 },
  { slug: 'ludhiana',    name: 'Ludhiana',    state: 'Punjab',          tier: 2 },
  { slug: 'amritsar',    name: 'Amritsar',    state: 'Punjab',          tier: 2 },
];

export function findCity(slug) {
  return CITIES.find(c => c.slug === slug.toLowerCase()) || null;
}
