import { describe, it, expect } from 'vitest';
import { generateAttendeeQRToken, verifyAttendeeQRToken } from '../src/services/qrService';

describe('Phase 1: Registration & Attendee Pass Token Suite', () => {
  const mockEventId = 'evt-hackathon-2026';
  const mockUserId = 'user-test-123';

  it('should generate an opaque signed QR token without leaking raw PII', () => {
    const token = generateAttendeeQRToken(mockEventId, mockUserId);
    expect(token).toBeDefined();
    expect(token.startsWith('EVT_PASS:')).toBe(true);

    // Ensure raw emails or phone numbers are not in the token
    expect(token.includes('@')).toBe(false);
    expect(token.includes('example.com')).toBe(false);
  });

  it('should verify a valid generated QR token successfully', () => {
    const token = generateAttendeeQRToken(mockEventId, mockUserId);
    const decoded = verifyAttendeeQRToken(token, mockEventId);

    expect(decoded.valid).toBe(true);
    expect(decoded.eventId).toBe(mockEventId);
    expect(decoded.userId).toBe(mockUserId);
    expect(decoded.timestamp).toBeGreaterThan(0);
  });

  it('should reject a tampered QR token signature', () => {
    const validToken = generateAttendeeQRToken(mockEventId, mockUserId);
    // Tamper with the signature portion
    const tamperedToken = validToken.slice(0, -3) + 'xyz';
    const decoded = verifyAttendeeQRToken(tamperedToken, mockEventId);

    expect(decoded.valid).toBe(false);
    expect(decoded.error).toContain('Tampered');
  });

  it('should reject a token intended for a different event', () => {
    const otherEventToken = generateAttendeeQRToken('other-event-999', mockUserId);
    const decoded = verifyAttendeeQRToken(otherEventToken, mockEventId);

    expect(decoded.valid).toBe(false);
    expect(decoded.error).toContain('not current event');
  });
});
