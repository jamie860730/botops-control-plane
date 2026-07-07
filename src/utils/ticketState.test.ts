import { beforeEach, describe, expect, it } from 'vitest';
import { seedData } from '../data/seedData';
import {
  applyTicketOverrides,
  persistTicketOwnerOverrides,
  persistTicketStatusOverrides,
  readTicketOwnerOverrides,
  readTicketStatusOverrides,
  ticketStatusStorageKey
} from './ticketState';

describe('ticketState shared overrides', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns seed defaults when nothing is persisted', () => {
    const statusById = readTicketStatusOverrides(seedData.supportTickets);
    for (const ticket of seedData.supportTickets) {
      expect(statusById[ticket.id]).toBe(ticket.status);
    }
    expect(applyTicketOverrides(seedData.supportTickets)).toEqual(seedData.supportTickets);
  });

  it('applies persisted status and owner overrides to every reader', () => {
    const target = seedData.supportTickets[0];
    persistTicketStatusOverrides({ [target.id]: 'Resolved' });
    persistTicketOwnerOverrides({ [target.id]: 'Compliance' });

    const effective = applyTicketOverrides(seedData.supportTickets);
    const overridden = effective.find((ticket) => ticket.id === target.id);
    expect(overridden?.status).toBe('Resolved');
    expect(overridden?.owner).toBe('Compliance');
    // Other tickets keep their seed values.
    for (const ticket of effective.filter((entry) => entry.id !== target.id)) {
      expect(ticket.status).toBe(seedData.supportTickets.find((seed) => seed.id === ticket.id)?.status);
    }

    // The map readers used by TicketCenter see the same override.
    expect(readTicketStatusOverrides(seedData.supportTickets)[target.id]).toBe('Resolved');
    expect(readTicketOwnerOverrides(seedData.supportTickets)[target.id]).toBe('Compliance');
  });

  it('keeps dashboard active-ticket math in sync after a resolve', () => {
    const before = applyTicketOverrides(seedData.supportTickets).filter((t) => t.status !== 'Resolved').length;
    persistTicketStatusOverrides({ [seedData.supportTickets[0].id]: 'Resolved' });
    const after = applyTicketOverrides(seedData.supportTickets).filter((t) => t.status !== 'Resolved').length;
    expect(after).toBe(before - 1);
  });

  it('falls back to seed defaults when storage is corrupted', () => {
    window.localStorage.setItem(ticketStatusStorageKey, '{not json');
    expect(applyTicketOverrides(seedData.supportTickets)).toEqual(seedData.supportTickets);
  });
});
