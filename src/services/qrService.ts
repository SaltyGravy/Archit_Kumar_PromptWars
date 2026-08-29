import QRCode from 'qrcode';

export interface DecodedQRToken {
  valid: boolean;
  eventId?: string;
  userId?: string;
  timestamp?: number;
  error?: string;
}

/**
 * Simple pseudo-HMAC checksum generator for browser & test environments.
 * Prevents tampering with attendee QR tokens.
 */
function generateSignature(eventId: string, userId: string, timestamp: number): string {
  const secretKey = 'NEXUS_EVENT_SECRET_SALT_2026';
  const str = `${eventId}:${userId}:${timestamp}:${secretKey}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
}

/**
 * Generates an opaque, tamper-resistant QR Token for an attendee.
 * Does NOT contain raw PII (emails or phone numbers).
 */
export function generateAttendeeQRToken(eventId: string, userId: string): string {
  const timestamp = Date.now();
  const sig = generateSignature(eventId, userId, timestamp);
  return `EVT_PASS:${eventId}:${userId}:${timestamp}:${sig}`;
}

/**
 * Decodes and verifies the authenticity of a scanned QR Token.
 */
export function verifyAttendeeQRToken(token: string, expectedEventId?: string): DecodedQRToken {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Invalid token format' };
  }

  const parts = token.trim().split(':');
  if (parts.length !== 5 || parts[0] !== 'EVT_PASS') {
    return { valid: false, error: 'Unrecognized pass format. Must be an EventNexus pass.' };
  }

  const [, eventId, userId, tsStr, signature] = parts;
  const timestamp = parseInt(tsStr, 10);

  if (isNaN(timestamp)) {
    return { valid: false, error: 'Corrupted token timestamp' };
  }

  if (expectedEventId && eventId !== expectedEventId) {
    return { valid: false, error: `Pass is for event ${eventId}, not current event ${expectedEventId}` };
  }

  const expectedSig = generateSignature(eventId, userId, timestamp);
  if (signature !== expectedSig) {
    return { valid: false, error: 'Tampered QR token signature. Verification rejected.' };
  }

  return {
    valid: true,
    eventId,
    userId,
    timestamp,
  };
}

/**
 * Generates a high-contrast QR Code Data URL (PNG)
 */
export async function generateQRCodeDataUrl(token: string): Promise<string> {
  try {
    return await QRCode.toDataURL(token, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR Code Data URL:', err);
    return '';
  }
}
