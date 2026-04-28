import sharp from 'sharp';
import { RAMPS, type RampName } from './ramps.js';

export interface ConvertOptions {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  ramp: RampName;
  invert: boolean;
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

  const { data } = await image
    .resize(width, height, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lines: string[] = [];

  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const brightness = data[y * width + x] / 255;
      const mapped = invert ? 1 - brightness : brightness;
      const index = Math.floor(mapped * (chars.length - 1));
      line += chars[index];
    }
    lines.push(line);
  }

  return lines.join('\n');
}
