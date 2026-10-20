import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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

const requestedBasePath = process.env.GITHUB_PAGES_BASE_PATH?.trim();
if (requestedBasePath) {
  const basePath = `/${requestedBasePath.replace(/^\/+|\/+$/g, '')}/`;
  const indexPath = join(dist, 'index.html');
  const source = await readFile(indexPath, 'utf8');
  const html = source
    .replace(/(src|href)="\/static\//g, `$1="${basePath}static/`)
    .replace('s.p="/"', `s.p="${basePath}"`);
  await writeFile(indexPath, html);
  await cp(indexPath, join(dist, '404.html'));
}

const distEntries = await readdir(dist);
await Promise.all(
  distEntries
    .filter(entry => entry === '.env' || entry.startsWith('.env.'))
    .map(entry => rm(join(dist, entry), { force: true })),
);
