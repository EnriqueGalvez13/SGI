import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '.vercel-preview');
mkdirSync(output, { recursive: true });
cpSync(path.join(root, 'public'), output, { recursive: true });
const home = readFileSync(path.join(root, 'lib/site.html'), 'utf8');
if (!home.includes('/sgi-premium-home.css')) throw new Error('Missing Premium stylesheet');
writeFileSync(path.join(output, 'index.html'), home);
mkdirSync(path.join(output, 'opinar'), { recursive: true });
cpSync(path.join(root, 'lib/review.html'), path.join(output, 'opinar/index.html'));
console.log('SGI Premium: visual preview built. Cloudflare APIs are not included.');
