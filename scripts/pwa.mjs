import { generateSW } from 'workbox-build';
const result = await generateSW({
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,png,ttf,woff,woff2,webmanifest}'],
  globIgnores: ['sw.js', 'workbox-*.js'],
  swDest: 'dist/sw.js',
  navigateFallback: '/index.html',
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: false,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
});
if (result.warnings.length) throw new Error(result.warnings.join('\n'));
console.log(`PWA: precached ${result.count} files (${result.size} bytes).`);
