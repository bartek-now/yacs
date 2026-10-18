import { mkdir } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const icon = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="#193D34"/><path d="M340 310L510 545L680 310M510 545V735" fill="none" stroke="#C5EB94" stroke-width="95" stroke-linecap="round" stroke-linejoin="round"/><circle cx="727" cy="708" r="45" fill="#C5EB94"/></svg>`,
);
await mkdir('public/icons', { recursive: true });
await mkdir('assets/images', { recursive: true });
for (const size of [192, 512])
  await sharp(icon).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
await sharp(icon).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png');
await sharp(icon).png().toFile('assets/images/yacs-icon.png');
