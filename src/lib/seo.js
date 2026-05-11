export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.homeizz.in').replace(/\/$/, '');

export const SITE_NAME = 'Homeizz';

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function titleCase(value = '') {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function truncateMeta(value = '', maxLength = 155) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

export function jsonLdScript(data) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
