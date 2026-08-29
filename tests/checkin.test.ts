import { describe, it, expect, beforeEach } from 'vitest';
import { realtimeStore } from '../src/services/realtimeStore';
import { generateAttendeeQRToken } from '../src/services/qrService';

describe('Phase 1: Attendee Check-In State Machine & Verification', () => {
  beforeEach(() => {
    realtimeStore.resetToSeedData();
  });

  it('should successfully check in a registered participant with valid QR token', async () => {
    const event = realtimeStore.getEvent();
    const targetUser = realtimeStore.getUsers().find(u => u.role === 'participant' && u.id === 'user-part-5');
    expect(targetUser).toBeDefined();

    const token = generateAttendeeQRToken(event.id, targetUser!.id);
    const result = await realtimeStore.checkInAttendee(token, 'onsite', 'user-org-1');

    expect(result.success).toBe(true);
    expect(result.checkIn).toBeDefined();
    expect(result.checkIn?.userId).toBe(targetUser!.id);
    expect(result.checkIn?.method).toBe('onsite');

    // Confirm presence in checkins list
    const checkins = realtimeStore.getCheckIns();
    expect(checkins.some(c => c.userId === targetUser!.id)).toBe(true);
  });

  it('should handle duplicate check-in idempotently with informative message', async () => {
    const event = realtimeStore.getEvent();
    // user-part-1 is already checked in in the seed data
    const token = generateAttendeeQRToken(event.id, 'user-part-1');
    const result = await realtimeStore.checkInAttendee(token, 'onsite', 'user-org-1');

    expect(result.success).toBe(true);
    expect(result.message).toContain('already checked in');
  });

  it('should reject check-in for unrecognized or unregistered user badge', async () => {
    const event = realtimeStore.getEvent();
    const token = generateAttendeeQRToken(event.id, 'non-existent-user-999');
    const result = await realtimeStore.checkInAttendee(token, 'onsite', 'user-org-1');

    expect(result.success).toBe(false);
    expect(result.message).toContain('Attendee record not found');
  });
});
