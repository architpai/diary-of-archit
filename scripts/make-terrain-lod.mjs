// Build a low-resolution first-paint heightmap for each terrain map.
//
// The full tokaido heightmap is ~2.8 MB and sits on the hero's critical path, so
// the map (the one idea the whole page is built on) is the LAST thing to appear.
// This writes a small sibling that renders immediately; TerrainScene swaps in the
// full-resolution texture once it arrives.
//
// Terrain-RGB cannot be resized channel-wise: R and G are the high and low bytes
// of a 16-bit value, so averaging them independently produces garbage elevations
// wherever the low byte wraps. We decode to real metres, box-filter the height
// field, then re-encode.
//
// Usage: node scripts/make-terrain-lod.mjs

import sharp from 'sharp';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'public', 'terrain');
const DIVISOR = 3;

const files = (await readdir(DIR)).filter(
  (f) => f.endsWith('-heightmap.png') && !f.endsWith('-lod.png'),
);

for (const file of files) {
  const src = path.join(DIR, file);
  const { data, info } = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels } = info;

  // The shader decodes normalised texels: r * 65280 + g * 255 - 32768. In raw
  // byte space that is r * 256 + g - 32768 (65280 / 255 === 256).
  const decode = (x, y) => {
    const i = (y * W + x) * channels;
    return data[i] * 256 + data[i + 1] - 32768;
  };

  const w = Math.max(1, Math.round(W / DIVISOR));
  const h = Math.max(1, Math.round(H / DIVISOR));
  const out = Buffer.alloc(w * h * 3);

  for (let y = 0; y < h; y++) {
    const y0 = Math.floor((y * H) / h);
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * H) / h));
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor((x * W) / w);
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * W) / w));

      let sum = 0;
      let n = 0;
      for (let yy = y0; yy < y1 && yy < H; yy++) {
        for (let xx = x0; xx < x1 && xx < W; xx++) {
          sum += decode(xx, yy);
          n++;
        }
      }

      // Re-encode the averaged elevation the same way fetch-terrain.mjs does.
      const encoded = Math.max(0, Math.min(65535, Math.round(sum / n) + 32768));
      const o = (y * w + x) * 3;
      out[o] = (encoded >> 8) & 0xff;
      out[o + 1] = encoded & 0xff;
      out[o + 2] = 0;
    }
  }

  const dest = src.replace(/\.png$/, '-lod.png');
  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    // palette: false is load-bearing. sharp will happily quantise this to a
    // 256-colour palette, which cannot represent a 16-bit height field: it
    // flattens peaks and craters the mean elevation.
    .png({ compressionLevel: 9, effort: 10, palette: false })
    .toFile(dest);

  console.log(`${file}: ${W}x${H} -> ${w}x${h} (${path.basename(dest)})`);
}
