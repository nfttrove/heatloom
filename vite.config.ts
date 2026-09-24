import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Stamp the page with a hash of the source that ships, so the scheduled
// live-drift check can tell whether heatloom.com matches `main`. Labelling
// must never break a build (Bolt runs this too): the script is loaded and
// run inside the try, and any failure stamps "unknown".
function buildIdMeta(): Plugin {
  let id = 'unknown';
  return {
    name: 'heatloom-build-id',
    async configResolved(config) {
      try {
        const { computeBuildId } = await import('./scripts/build-id.mjs');
        id = computeBuildId(config.root);
      } catch {
        id = 'unknown';
      }
    },
    transformIndexHtml: (html) =>
      html.replace('</head>', `  <meta name="heatloom-build" content="${id}" />\n  </head>`),
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), buildIdMeta()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
