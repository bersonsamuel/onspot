/**
 * Static category metadata and utility helpers.
 * All job data comes from Supabase — see AppContext for data fetching.
 */

export const CATEGORY_MEDIA = {
  Catering: {
    src: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80",
    alt: "Catering banquet food buffet",
  },
  Promotions: {
    src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
    alt: "Brand promotion exhibition launch",
  },
  Pamphlet: {
    src: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
    alt: "Flyer and pamphlet distribution",
  },
  Ushering: {
    src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
    alt: "VIP ushering & hospitality service",
  },
  Setup: {
    src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
    alt: "Stage sound & event setup",
  },
};

export function getCategoryMedia(category: string) {
  return CATEGORY_MEDIA[category as keyof typeof CATEGORY_MEDIA] || CATEGORY_MEDIA.Catering;
}

export const KNOWN_LOCALITIES = [
  { name: "Chennai (City Center)", lat: 13.0827, lng: 80.2707 },
  { name: "Adyar", lat: 13.0012, lng: 80.2565 },
  { name: "Guindy", lat: 13.0067, lng: 80.2206 },
  { name: "Velachery", lat: 12.9756, lng: 80.2207 },
  { name: "Nandanam", lat: 13.0332, lng: 80.2422 },
  { name: "Taramani", lat: 12.9889, lng: 80.2444 },
  { name: "Royapettah", lat: 13.0524, lng: 80.2645 },
];

export const CATEGORIES = [
  { key: "All", label: "All Openings" },
  { key: "Catering", label: "Catering Services" },
  { key: "Promotions", label: "Event Promotions" },
  { key: "Pamphlet", label: "Pamphlet Distribution" },
  { key: "Ushering", label: "Ushering & VIP" },
  { key: "Setup", label: "Stage & Logistics" },
];

/**
 * Derive a human-readable date label from a UTC ISO timestamp.
 * Returns "Today", "Tomorrow", or a formatted date like "15 Oct 2026".
 */
export function getDateLabel(isoDate?: string | null): string {
  if (!isoDate) return 'TBD';
  const d = new Date(isoDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, tomorrow)) return 'Tomorrow';

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
