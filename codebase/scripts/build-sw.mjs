// Writes dist/sw.js from scripts/sw.template.js, with the list of files in this build and a version
// derived from their contents (so every deploy with changes installs a fresh cache). Runs after `vite build`.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
// 404.html is a copy of index.html for deep links; the service worker serves the app shell itself.
const skip = new Set(['sw.js', '404.html', 'CNAME']);

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (!skip.has(relative(dist, path))) files.push(path);
  }
};
walk(dist);
files.sort();

const template = readFileSync(new URL('./sw.template.js', import.meta.url), 'utf8');
// The version changes with any app file and with the service worker's own code.
const hash = createHash('sha256').update(template);
for (const file of files) hash.update(relative(dist, file)).update(readFileSync(file));
const version = hash.digest('hex').slice(0, 12);

const urls = ['/', ...files.map((f) => `/${relative(dist, f)}`)];
writeFileSync(join(dist, 'sw.js'), template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(urls, null, 2)));
console.log(`sw.js: ${urls.length} files, version ${version}`);
