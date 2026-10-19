import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const publicDirectory = join(root, 'public');

await mkdir(join(dist, 'icons'), { recursive: true });
await Promise.all([
  cp(join(publicDirectory, 'manifest.json'), join(dist, 'manifest.json')),
  cp(join(publicDirectory, 'sw.js'), join(dist, 'sw.js')),
  cp(join(publicDirectory, 'icons'), join(dist, 'icons'), { recursive: true }),
  cp(join(dist, 'html/main/index.html'), join(dist, 'index.html')),
]);

const distEntries = await readdir(dist);
await Promise.all(
  distEntries
    .filter(entry => entry === '.env' || entry.startsWith('.env.'))
    .map(entry => rm(join(dist, entry), { force: true })),
);
