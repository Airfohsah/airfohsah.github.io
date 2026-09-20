// One-off migration script: merges the word-list revision found in the
// stray "!DOCTYPE.md" file (actually HTML, containing extra words not yet
// in index.html's DEFAULT_WORDS) into one canonical words.json.
// Run with: node scripts/merge-words.js
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const indexHtmlPath = path.join(repoRoot, 'index.html');
const doctypeMdPath = path.join(repoRoot, '!DOCTYPE.md');

function extractDefaultWords(html) {
  const match = html.match(/const DEFAULT_WORDS\s*=\s*(\{[\s\S]*?\n\})\s*;/);
  if (!match) throw new Error('Could not find DEFAULT_WORDS block');
  // eslint-disable-next-line no-new-func
  return new Function('return ' + match[1])();
}

const base = extractDefaultWords(fs.readFileSync(indexHtmlPath, 'utf8'));
const extra = extractDefaultWords(fs.readFileSync(doctypeMdPath, 'utf8'));

const merged = {};
const report = [];

const allKeys = new Set([...Object.keys(base), ...Object.keys(extra)]);
for (const key of allKeys) {
  const baseCat = base[key];
  const extraCat = extra[key];
  const source = baseCat || extraCat;
  const seen = new Map(); // lowercase -> original-cased word (prefer base casing)
  (baseCat ? baseCat.words : []).forEach((w) => seen.set(w.toLowerCase(), w));
  let added = 0;
  (extraCat ? extraCat.words : []).forEach((w) => {
    const k = w.toLowerCase();
    if (!seen.has(k)) {
      seen.set(k, w);
      added++;
    }
  });
  merged[key] = {
    name: source.name,
    icon: source.icon,
    difficulty: source.difficulty || '',
    paid: source.paid === true,
    enabled: source.enabled !== false,
    words: Array.from(seen.values()),
  };
  if (added > 0) report.push(`${key}: +${added} word(s) merged from !DOCTYPE.md`);
}

const outDataPath = path.join(__dirname, '..', 'src', 'data', 'words.default.json');
const outPublicPath = path.join(repoRoot, 'words.json');

fs.mkdirSync(path.dirname(outDataPath), { recursive: true });
fs.writeFileSync(outDataPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
fs.writeFileSync(outPublicPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');

console.log('Merged word categories:', Object.keys(merged).length);
console.log('Total words:', Object.values(merged).reduce((n, c) => n + c.words.length, 0));
if (report.length) {
  console.log('\nMerged from !DOCTYPE.md:');
  report.forEach((line) => console.log(' -', line));
} else {
  console.log('\nNo new words found in !DOCTYPE.md beyond index.html.');
}
console.log('\nWrote:');
console.log(' -', outDataPath);
console.log(' -', outPublicPath);
