// Shared pure helpers (works in server or client components).

/** Escape untrusted strings before rendering into HTML. */
export function escapeHTML(v) {
  if (v == null) return '';
  return String(v).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/** Format INR currency. */
export function inr(paise) {
  const rupees = Math.round((paise || 0) / 100);
  return '₹' + rupees.toLocaleString('en-IN');
}

/** Convert rupees (decimal) to paise (Razorpay expects paise integers). */
export function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

/** Clean slug helper for user-submitted text. */
export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
