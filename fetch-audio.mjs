#!/usr/bin/env node
/**
 * fetch-audio.mjs — pull real recorded pronunciation clips for the booth demo's
 * 75 phrases from Wika's PUBLIC audio bucket (anonymous GET, no API key needed —
 * see wika-frontend-expo/src/services/assetOrigin.ts for why this bucket is public).
 *
 * Run this on YOUR machine, where the real Supabase URL lives (not on the shared box).
 *
 *   SUPABASE_URL=https://xxxxx.supabase.co node fetch-audio.mjs
 *
 * or, if you have the app repo checked out and its .env loaded in your shell already:
 *
 *   node fetch-audio.mjs
 *
 * (it will fall back to reading EXPO_PUBLIC_SUPABASE_ASSET_URL / EXPO_PUBLIC_SUPABASE_URL
 * from process.env if SUPABASE_URL isn't set — e.g. via `source .env` or a dotenv-loaded
 * shell, your call).
 *
 * Writes clips into ./audio/{id}.mp3 next to this script, plus audio-manifest.json
 * listing which phrase ids actually got a real clip (so app.js can show a speaker
 * button only where one exists). Missing clips are skipped silently — same
 * "silent is fine" philosophy as the real app. Safe to re-run any time.
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOTH_PHRASES } from './phrases.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, 'audio');

const BASE = (
  process.env.SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_ASSET_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  ''
).replace(/\/+$/, '');

if (!BASE) {
  console.error(
    'No Supabase URL found. Run with:\n' +
    '  SUPABASE_URL=https://xxxxx.supabase.co node fetch-audio.mjs\n' +
    '(find the value in wika-frontend-expo/.env as EXPO_PUBLIC_SUPABASE_URL)',
  );
  process.exit(1);
}

const DIALECT_CODE = { tagalog: 'tgl', cebuano: 'ceb', ilocano: 'ilo' };

/** Mirrors slugForKey() in src/audio/wordAudio.ts exactly. */
function slug(token) {
  return token
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Same split rule as the app: whitespace + teaching punctuation. */
function tokenize(text) {
  return text
    .replace(/[([][^)\]]*[)\]]/g, '') // strip bracketed glosses
    .replace(/[‹›]/g, '')
    .split(/[\s·•/,;:—–→=+«»"""…?!.]+/)
    .map(slug)
    .filter(Boolean);
}

function publicUrl(key) {
  return `${BASE}/storage/v1/object/public/wika-audio/${key}`;
}

async function tryFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function resolveClip(phrase) {
  const code = DIALECT_CODE[phrase.dialect];
  if (!code) return null;
  const tokens = tokenize(phrase.target);
  if (tokens.length === 0) return null;

  // Phrase-level recording first (one continuous clip).
  if (tokens.length >= 2) {
    const phraseBuf = await tryFetch(publicUrl(`audio/${code}/phrase/${tokens.join('-')}.mp3`));
    if (phraseBuf) return { buf: phraseBuf, kind: 'phrase' };
  }

  // Fall back to the single word, when the phrase is really just one word.
  if (tokens.length === 1) {
    const wordBuf = await tryFetch(publicUrl(`audio/${code}/${tokens[0]}.mp3`));
    if (wordBuf) return { buf: wordBuf, kind: 'word' };
  }

  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const found = [];
  const missing = [];

  for (const phrase of BOOTH_PHRASES) {
    const clip = await resolveClip(phrase);
    if (clip) {
      await writeFile(path.join(OUT_DIR, `${phrase.id}.mp3`), clip.buf);
      found.push({ id: phrase.id, target: phrase.target, kind: clip.kind });
      console.log(`  ✓ ${phrase.id}  (${clip.kind})  ${phrase.target}`);
    } else {
      missing.push({ id: phrase.id, target: phrase.target });
      console.log(`  · ${phrase.id}  no clip  ${phrase.target}`);
    }
  }

  await writeFile(
    path.join(ROOT, 'audio-manifest.json'),
    JSON.stringify({ found: found.map((f) => f.id), generatedAt: new Date().toISOString() }, null, 2),
  );

  console.log(`\n${found.length}/${BOOTH_PHRASES.length} phrases got a real clip.`);
  console.log(`Clips saved to ${OUT_DIR}/`);
  console.log(`audio-manifest.json written — app.js reads this to decide which phrases show a speaker button.`);
  if (missing.length) {
    console.log(`\nNo clip exists yet for: ${missing.map((m) => m.id).join(', ')}`);
  }
}

main();
