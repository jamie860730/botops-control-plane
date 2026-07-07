import type { SupportTicket } from '../types';

/**
 * Shared ticket-state access so every view (TicketCenter, OverviewDashboard, ...)
 * reads the same localStorage-backed overrides instead of raw seed data.
 */
export const ticketStatusStorageKey = 'botops.ticketStatusById';
export const ticketOwnerStorageKey = 'botops.ticketOwnerById';

function readOverrideMap(storageKey: string): Record<string, string> {
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return {};
  }
  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function readTicketStatusOverrides(tickets: SupportTicket[]): Record<string, SupportTicket['status']> {
  const defaults = Object.fromEntries(tickets.map((ticket) => [ticket.id, ticket.status]));
  return { ...defaults, ...readOverrideMap(ticketStatusStorageKey) } as Record<string, SupportTicket['status']>;
}

export function readTicketOwnerOverrides(tickets: SupportTicket[]): Record<string, SupportTicket['owner']> {
  const defaults = Object.fromEntries(tickets.map((ticket) => [ticket.id, ticket.owner]));
  return { ...defaults, ...readOverrideMap(ticketOwnerStorageKey) } as Record<string, SupportTicket['owner']>;
}

export function persistTicketStatusOverrides(value: Record<string, SupportTicket['status']>) {
  window.localStorage.setItem(ticketStatusStorageKey, JSON.stringify(value));
}

export function persistTicketOwnerOverrides(value: Record<string, SupportTicket['owner']>) {
  window.localStorage.setItem(ticketOwnerStorageKey, JSON.stringify(value));
}

/** Returns tickets with any persisted status/owner overrides applied. */
export function applyTicketOverrides(tickets: SupportTicket[]): SupportTicket[] {
  const statusById = readOverrideMap(ticketStatusStorageKey) as Record<string, SupportTicket['status']>;
  const ownerById = readOverrideMap(ticketOwnerStorageKey) as Record<string, SupportTicket['owner']>;
  return tickets.map((ticket) => ({
    ...ticket,
    status: statusById[ticket.id] ?? ticket.status,
    owner: ownerById[ticket.id] ?? ticket.owner
  }));
}
