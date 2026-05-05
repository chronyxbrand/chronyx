import { describe, expect, it, vi, afterEach } from 'vitest';
import { CART_KEY, formatCurrency, loadCart } from '../data/store';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('store helpers', () => {
  it('formats INR amounts without fractional paise', () => {
    expect(formatCurrency(123456)).toBe('₹1,23,456');
  });

  it('returns an empty cart outside a browser context', () => {
    vi.stubGlobal('window', undefined);
    expect(loadCart()).toEqual([]);
  });

  it('loads valid cart arrays from localStorage', () => {
    const cart = [{ id: 'clock-1', quantity: 2 }];
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key) => (key === CART_KEY ? JSON.stringify(cart) : null),
      },
    });

    expect(loadCart()).toEqual(cart);
  });

  it('rejects malformed or non-array cart storage', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => '{"not":"a-cart"}',
      },
    });

    expect(loadCart()).toEqual([]);

    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => '{bad json',
      },
    });

    expect(loadCart()).toEqual([]);
  });
});
