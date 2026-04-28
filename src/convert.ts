import chalk from 'chalk';
import sharp from 'sharp';
import { RAMPS, type RampName } from './ramps.js';

export interface ConvertOptions {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  ramp: RampName;
  invert: boolean;
  color: boolean;
}

export async function convertToAscii(imagePath: string, options: ConvertOptions): Promise<string> {
  const { ramp, invert } = options;
  const chars = RAMPS[ramp];

  const image = sharp(imagePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Cannot read dimensions from: ${imagePath}`);
  }

  const imgW = metadata.width;
  const imgH = metadata.height;
  const maxW = options.maxWidth ?? 100;
  const maxH = options.maxHeight ?? 40;

  let width: number;
  let height: number;

  if (options.width && options.height) {
    width = options.width;
    height = options.height;
  } else if (options.width) {
    width = options.width;
    height = Math.min(Math.round((width * imgH) / imgW / 2), maxH);
  } else if (options.height) {
    height = options.height;
    width = Math.min(Math.round((height * imgW) / imgH * 2), maxW);
  } else {
    width = maxW;
    height = Math.min(Math.round((width * imgH) / imgW / 2), maxH);
  }

  const channels = options.color ? 3 : 1;
  const pipeline = options.color
    ? image.resize(width, height, { fit: 'fill' }).raw()
    : image.resize(width, height, { fit: 'fill' }).grayscale().raw();

  const { data: pixels } = await pipeline.toBuffer({ resolveWithObject: true });

  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = pixels[i];
      const g = options.color ? pixels[i + 1] : r;
      const b = options.color ? pixels[i + 2] : r;
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const mapped = invert ? 1 - brightness : brightness;
      const index = Math.floor(mapped * (chars.length - 1));
      const char = chars[index];
      line += options.color ? chalk.rgb(r, g, b)(char) : char;
    }
    lines.push(line);
  }

  return lines.join('\n');
}
