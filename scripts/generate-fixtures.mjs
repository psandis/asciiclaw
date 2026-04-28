import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const width = 40;
const height = 20;
const pixels = Buffer.alloc(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    pixels[y * width + x] = Math.floor((x / (width - 1)) * 255);
  }
}

await sharp(pixels, { raw: { width, height, channels: 1 } })
  .png()
  .toFile(join(root, 'tests/fixtures/gradient.png'));

console.log('tests/fixtures/gradient.png written');
