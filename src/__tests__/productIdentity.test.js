import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildPublicProductId,
  buildUnitQrCodeUrl,
  buildUnitVerificationPath,
  buildUnitVerificationUrl,
  createAuthenticityUnit,
} from '../lib/productIdentity';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('product identity helpers', () => {
  it('creates compact public product ids from noisy values', () => {
    expect(buildPublicProductId('prod-123_abc!@#xyz')).toBe('CHX-PROD123ABC');
    expect(buildPublicProductId('')).toBe('CHX-PENDING0000');
  });

  it('creates deterministic authenticity units when crypto is stubbed', () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'abcd1234-ef56-7890-abcd-1234567890ef',
    });

    const unit = createAuthenticityUnit({ name: 'Walnut Orbit' }, 7);

    expect(unit).toEqual({
      serial_number: 7,
      public_unit_id: 'CHXU-WALN-0007-ABCD',
      authenticity_code: 'AUTH-1234-EF56-7890',
      status: 'available',
    });
  });

  it('builds encoded verification paths, absolute urls, and QR urls', () => {
    const unit = {
      public_unit_id: 'CHXU-WALN-0007-ABCD',
      authenticity_code: 'AUTH-12 34/EF?56',
    };

    const path = buildUnitVerificationPath(unit);
    expect(path).toBe('/verify/unit/CHXU-WALN-0007-ABCD?code=AUTH-12%2034%2FEF%3F56');
    expect(buildUnitVerificationUrl(unit, 'https://example.test')).toBe(`https://example.test${path}`);
    expect(buildUnitQrCodeUrl(unit, 'https://example.test')).toContain(encodeURIComponent(`https://example.test${path}`));
  });
});
