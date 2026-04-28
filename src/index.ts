import { writeFileSync } from 'node:fs';
import { Command } from 'commander';
import { convertToAscii } from './convert.js';
import { DEFAULT_RAMP, RAMP_NAMES, type RampName } from './ramps.js';

const terminalCols = process.stdout.columns ?? 100;
const terminalRows = process.stdout.rows ?? 40;

const program = new Command();

program
  .name('asciiclaw')
  .description('Convert images to ASCII art')
  .version('0.1.0')
  .argument('<image>', 'path to image file (PNG, JPG, WebP, GIF)')
  .option('-w, --width <number>', 'output width in characters')
  .option('-H, --height <number>', 'output height in characters')
  .option('-r, --ramp <name>', 'character ramp: classic | blocks | dense', DEFAULT_RAMP)
  .option('-i, --invert', 'invert brightness mapping', false)
  .option('-c, --color', 'enable color output using original image colors', false)
  .option('-o, --output <file>', 'write output to file instead of stdout')
  .action(async (imagePath: string, opts: { width?: string; height?: string; ramp: string; invert: boolean; color: boolean; output?: string }) => {
    const explicitWidth = opts.width !== undefined ? parseInt(opts.width, 10) : undefined;
    const explicitHeight = opts.height !== undefined ? parseInt(opts.height, 10) : undefined;

    if (explicitWidth !== undefined && (Number.isNaN(explicitWidth) || explicitWidth < 10 || explicitWidth > 1000)) {
      console.error('Error: --width must be a number between 10 and 1000');
      process.exit(1);
    }

    if (explicitHeight !== undefined && (Number.isNaN(explicitHeight) || explicitHeight < 1 || explicitHeight > 1000)) {
      console.error('Error: --height must be a number between 1 and 1000');
      process.exit(1);
    }

    if (!RAMP_NAMES.includes(opts.ramp as RampName)) {
      console.error(`Error: --ramp must be one of: ${RAMP_NAMES.join(', ')}`);
      process.exit(1);
    }

    try {
      const result = await convertToAscii(imagePath, {
        width: explicitWidth,
        height: explicitHeight,
        maxWidth: terminalCols,
        maxHeight: terminalRows,
        ramp: opts.ramp as RampName,
        invert: opts.invert,
        color: opts.color,
      });

      if (opts.output) {
        writeFileSync(opts.output, result, 'utf8');
      } else {
        process.stdout.write(result + '\n');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error: ${message}`);
      process.exit(1);
    }
  });

program.parse();
