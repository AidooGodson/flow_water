import { format, parseISO } from 'date-fns';

export function fmt(d: string | null | undefined): string {
  if (!d) return '—';
  try {
    return format(parseISO(d), 'dd MMM yyyy');
  } catch {
    return d;
  }
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export const STATUS_COLOURS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Pending: 'bg-amber-100 text-amber-800',
  Completed: 'bg-green-100 text-green-800',
  Reviewed: 'bg-purple-100 text-purple-800',
};

export const PRODUCTS = ['Bottled Water', 'Sachet Water', 'Dispenser'] as const;
export const BUYER_TYPES = ['Bulk buyer', 'Medium scale', 'Small scale'] as const;
export const STATUS_OPTIONS = ['All', 'New', 'Pending', 'Completed', 'Reviewed'];
export const PRODUCT_OPTIONS = ['All', 'Bottled Water', 'Sachet Water', 'Dispenser'];
export const BUYER_TYPE_OPTIONS = ['All', 'Bulk buyer', 'Medium scale', 'Small scale'];
