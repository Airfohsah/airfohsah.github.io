// One-off content-quality pass over words.default.json, applying the fixes
// from the word-list review: dedupe typos, fix capitalization, drop
// unclear/off-theme entries, reword awkward phrasing. See HANDOVER.md for
// the full rationale behind each change.
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'words.default.json');
const publicPath = path.join(__dirname, '..', '..', 'words.json');

const words = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function removeWords(catKey, toRemove) {
  const cat = words[catKey];
  const before = cat.words.length;
  cat.words = cat.words.filter((w) => !toRemove.includes(w));
  const removed = before - cat.words.length;
  if (removed !== toRemove.length) {
    console.warn(`WARN [${catKey}]: expected to remove ${toRemove.length}, actually removed ${removed}`);
  }
}

function renameWord(catKey, from, to) {
  const cat = words[catKey];
  const idx = cat.words.indexOf(from);
  if (idx === -1) {
    console.warn(`WARN [${catKey}]: "${from}" not found, skipping rename to "${to}"`);
    return;
  }
  cat.words[idx] = to;
}

// ---- Food ----
removeWords('food', ['Eguisi Soup']); // duplicate/typo of "Egusi soup"

// ---- Emotions ----
renameWord('emotions', 'suffer', 'Suffer');
renameWord('emotions', 'Butterflies in my stomach', 'Butterflies');
renameWord('emotions', 'Low self esteem', 'Low self-esteem');

// ---- Activities ----
renameWord('activities', 'buying Mama put', 'Buying food from Mama put');
renameWord('activities', 'Third mainland bridge traffic', 'Third Mainland Bridge traffic');
removeWords('activities', ['Pop ceremony', 'Teaching', 'Owambe dancing']); // unclear / too generic / dup of "Dancing at owambe"

// ---- Movies ----
renameWord('movies', 'Nigerian idol', 'Nigerian Idol');
renameWord('movies', 'Wale Adenuga productions', 'Wale Adenuga Productions');
renameWord('movies', 'AY (Comedian)', 'AY');

// ---- Locations ----
removeWords('locations', ['Oshogbo']); // duplicate of "Osogbo"
renameWord('locations', 'Ogun', 'Olumo Rock'); // was a whole state, not a specific place
renameWord('locations', 'Cross River', 'Obudu Mountain Resort'); // same issue

// ---- Music ----
renameWord('music', 'Ye', 'Ye by Burna Boy'); // was an isolated, ambiguous single word
renameWord('music', 'Afronation festival', 'Afro Nation festival');

// ---- Slangs ----
removeWords('slangs', ['Opor', 'God when', 'Stay woke', 'Different strokes']); // unclear, or not distinctly Naija
renameWord('slangs', 'Blessing scatter', 'Blessings scatter');

// ---- Animals ----
renameWord('animals', 'Grass snake', 'Puff adder'); // "grass snake" is a European species, not African

// ---- Occupations ----
removeWords('occupations', ['Mai Suya']); // duplicate of "Suya seller"
renameWord('occupations', 'akara seller', 'Akara seller');
renameWord('occupations', 'Fish monger', 'Fishmonger');
renameWord('occupations', 'Hair dresser', 'Hairdresser');

// ---- Sports ----
removeWords('sports', ['Draft', 'Ayo game', 'Road tennis']); // "Draft" wrong/dup of "Draught"; "Ayo game" dup of "Ayo olopon"; not a Nigerian sport
renameWord('sports', 'Pro evolution soccer', 'Pro Evolution Soccer');
renameWord('sports', 'FIFA game', 'FIFA');

fs.writeFileSync(dataPath, JSON.stringify(words, null, 2) + '\n', 'utf8');
fs.writeFileSync(publicPath, JSON.stringify(words, null, 2) + '\n', 'utf8');

const totals = Object.entries(words).map(([k, c]) => `${k}: ${c.words.length}`);
console.log('Done. Category totals:');
totals.forEach((t) => console.log(' -', t));
console.log('Total words:', Object.values(words).reduce((n, c) => n + c.words.length, 0));
