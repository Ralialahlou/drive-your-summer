// One-off image optimizer: resizes the heavy source PNG/JPGs and writes
// normalized WebP into public/assets. Run with: npm run optimize-images
//
// Sources live in _legacy/source-assets/ (kept out of the build); the app only
// ships the WebP output. Re-run this if a source image is replaced/updated.
import { readdir, stat, mkdir } from 'node:fs/promises'
import { join, extname, basename, dirname, relative } from 'node:path'
import sharp from 'sharp'

const SRC = new URL('../_legacy/source-assets/', import.meta.url).pathname
const DEST = new URL('../public/assets/', import.meta.url).pathname

const MAX_WIDTH = 1600
const QUALITY = 78

// Explicit source -> shipped WebP name map. Source filenames are inconsistent
// (`Soueast 1.jpg` vs `soueast 5.jpg`) and the app references exact names, so we
// pin each one rather than guessing. img/keys/* keep their `Key` casing.
const NAME_MAP = {
  'Soueast 1.jpg': 'soueast-1.webp',
  'Soueast 2.jpg': 'soueast-2.webp',
  'Soueast 3.jpg': 'soueast-3.webp',
  'Soueast 4.jpg': 'soueast-4.webp',
  'soueast 5.jpg': 'soueast-5.webp',
  'image end of page.png': 'image-end-of-page.webp',
  'mm-logo.png': 'mm-logo.webp',
  'mm-logo-black.png': 'mm-logo-black.webp',
  'mm-wordmark.png': 'mm-wordmark.webp',
  'img/keys/Key2.png': 'img/keys/Key2.webp',
  'img/keys/Key12.png': 'img/keys/Key12.webp',
  'img/keys/Key19.png': 'img/keys/Key19.webp',
  'img/keys/Key22.png': 'img/keys/Key22.webp',
  'img/keys/Key23.png': 'img/keys/Key23.webp',
  'img/keys/Key24.png': 'img/keys/Key24.webp',
}

function destName(srcRelPath) {
  const mapped = NAME_MAP[srcRelPath]
  if (mapped) return mapped
  // Fallback for any new source: hyphenate, preserve casing.
  const dir = dirname(srcRelPath)
  const stem = basename(srcRelPath, extname(srcRelPath)).replace(/\s+/g, '-')
  return join(dir === '.' ? '' : dir, `${stem}.webp`)
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...(await walk(full)))
    else files.push(full)
  }
  return files
}

const files = await walk(SRC)
let saved = 0
for (const file of files) {
  const ext = extname(file).toLowerCase()
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue
  const rel = relative(SRC, file)
  const out = join(DEST, destName(rel))
  await mkdir(dirname(out), { recursive: true })
  const before = (await stat(file)).size
  await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out)
  const after = (await stat(out)).size
  saved += before - after
  console.log(`${rel} -> ${destName(rel)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`)
}
console.log(`\nTotal saved: ${(saved / 1024 / 1024).toFixed(2)} MB`)
