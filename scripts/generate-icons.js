import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Create a simple gradient icon with emoji
async function generateIcon(size, filename) {
  // Create SVG with gradient background
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="${size / 2}" y="${size * 0.65}" font-size="${size * 0.45}" text-anchor="middle" fill="white" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">💪</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(publicDir, filename));

  console.log(`Generated ${filename}`);
}

async function main() {
  try {
    await generateIcon(192, 'pwa-192x192.png');
    await generateIcon(512, 'pwa-512x512.png');
    await generateIcon(180, 'apple-touch-icon.png');
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();
