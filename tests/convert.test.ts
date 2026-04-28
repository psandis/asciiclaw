import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { convertToAscii } from '../src/convert.js';
import { RAMPS } from '../src/ramps.js';

const fixture = join(import.meta.dirname, 'images/gradient.png');

describe('convertToAscii', () => {
  it('output has correct number of lines for given width', async () => {
    const result = await convertToAscii(fixture, { width: 40, ramp: 'classic', invert: false });
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('each line has correct width', async () => {
    const width = 40;
    const result = await convertToAscii(fixture, { width, ramp: 'classic', invert: false });
    for (const line of result.split('\n')) {
      expect(line.length).toBe(width);
    }
  });

  it('output only contains characters from the selected ramp', async () => {
    for (const ramp of ['classic', 'blocks', 'dense'] as const) {
      const result = await convertToAscii(fixture, { width: 40, ramp, invert: false });
      const validChars = new Set(RAMPS[ramp].split(''));
      for (const char of result.replace(/\n/g, '')) {
        expect(validChars.has(char)).toBe(true);
      }
    }
  });

  it('invert produces different output than normal', async () => {
    const normal = await convertToAscii(fixture, { width: 40, ramp: 'classic', invert: false });
    const inverted = await convertToAscii(fixture, { width: 40, ramp: 'classic', invert: true });
    expect(normal).not.toBe(inverted);
  });

  it('throws on missing file', async () => {
    await expect(
      convertToAscii('nonexistent.png', { width: 40, ramp: 'classic', invert: false }),
    ).rejects.toThrow();
  });
});
