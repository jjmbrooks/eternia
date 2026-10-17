import { defineConfig } from 'vite';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

// Genera dist/sw.js con la lista de precache (todo el build: es pequeño).
function eterniaServiceWorker() {
  let outDir, root;
  return {
    name: 'eternia-sw', apply: 'build',
    configResolved(c) { outDir = c.build.outDir; root = c.root; },
    closeBundle() {
      const dir = join(root, outDir); const files = [];
      const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : files.push(relative(dir, p).split('\\').join('/')); } };
      walk(dir);
      const list = files.filter((f) => f !== 'sw.js' && !f.endsWith('.map')).sort();
      const hash = createHash('sha256'); for (const f of list) hash.update(f).update(readFileSync(join(dir, f)));
      const sw = readFileSync(join(root, 'src/sw/sw.js'), 'utf8')
        .replace('__SW_VERSION__', hash.digest('hex').slice(0, 10))
        .replace('__PRECACHE_MANIFEST__', JSON.stringify(list));
      writeFileSync(join(dir, 'sw.js'), sw);
    },
  };
}

export default defineConfig({
  base: '/eternia/',
  plugins: [eterniaServiceWorker()],
  test: { include: ['tests/**/*.test.js'] },
});
