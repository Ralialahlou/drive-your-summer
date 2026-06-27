// One-off image optimizer: resizes + converts the heavy PNG/JPG assets to WebP.
// Run with: npm run optimize-images
// Originals are left untouched; WebP siblings are written next to them.
import { readdir, stat } from 'node:fs/promises'
import { join, extname, basename, dirname } from 'node:path'
import sharp from 'sharp'

const ASSETS = new URL('../public/assets/', import.meta.url).pathname

// Max width per asset group (display sizes are far smaller than the source files).
const MAX_WIDTH = 1600
const QUALITY = 78

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

const files = await walk(ASSETS)
let saved = 0
for (const file of files) {
  const ext = extname(file).toLowerCase()
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue
  const out = join(dirname(file), basename(file, ext) + '.webp')
  const before = (await stat(file)).size
  await sharp(file)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(out)
  const after = (await stat(out)).size
  saved += before - after
  console.log(
    `${basename(file)}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`
  )
}
console.log(`\nTotal saved: ${(saved / 1024 / 1024).toFixed(2)} MB`)
console.log('Update <img> srcs to the .webp files where appropriate.')
