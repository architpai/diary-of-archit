// One-off generator: downloads terrarium-encoded elevation tiles (Mapzen/AWS
// open data) for the Kanto region and stitches them into a single heightmap
// PNG used by the 3D hero. Elevation stays RGB-encoded; the shader decodes
// h = (R*256 + G + B/256) - 32768.
//
// Usage: node scripts/fetch-terrain.mjs

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ZOOM = 10;
// Mt. Fuji (138.73) to the far side of Tokyo Bay, Izu peninsula up past Tokyo.
const BOUNDS = { west: 138.35, east: 140.55, south: 34.85, north: 36.05 };
const TILE_SIZE = 256;
const TILE_URL = (z, x, y) =>
  `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

const OUT_DIR = path.resolve("public/terrain");

function lonToTileX(lon, z) {
  return Math.floor(((lon + 180) / 360) * 2 ** z);
}
function latToTileY(lat, z) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2) * 2 ** z
  );
}
function tileXToLon(x, z) {
  return (x / 2 ** z) * 360 - 180;
}
function tileYToLat(y, z) {
  const n = Math.PI - (2 * Math.PI * y) / 2 ** z;
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

const x0 = lonToTileX(BOUNDS.west, ZOOM);
const x1 = lonToTileX(BOUNDS.east, ZOOM);
const y0 = latToTileY(BOUNDS.north, ZOOM);
const y1 = latToTileY(BOUNDS.south, ZOOM);

const cols = x1 - x0 + 1;
const rows = y1 - y0 + 1;
console.log(`Fetching ${cols}x${rows} tiles at z${ZOOM}...`);

const composites = [];
for (let ty = y0; ty <= y1; ty++) {
  for (let tx = x0; tx <= x1; tx++) {
    const url = TILE_URL(ZOOM, tx, ty);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Tile fetch failed ${res.status}: ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    composites.push({
      input: buf,
      left: (tx - x0) * TILE_SIZE,
      top: (ty - y0) * TILE_SIZE,
    });
    process.stdout.write(".");
  }
}
console.log("\nStitching...");

await mkdir(OUT_DIR, { recursive: true });
const { data: fullRaw, info: rawInfo } = await sharp({
  create: {
    width: cols * TILE_SIZE,
    height: rows * TILE_SIZE,
    channels: 3,
    background: { r: 0, g: 0, b: 0 },
  },
})
  .composite(composites)
  .raw()
  .toBuffer({ resolveWithObject: true });
const CH = rawInfo.channels; // composite may promote to RGBA

// Downsample 2x by averaging decoded heights (resizing the RGB encoding
// directly would corrupt elevations at the R/G carry boundary), then
// re-encode into R/G only — dropping terrarium's sub-meter B channel noise
// roughly halves the PNG size.
const SCALE = 2;
const fw = cols * TILE_SIZE;
const fh = rows * TILE_SIZE;
const ow = fw / SCALE;
const oh = fh / SCALE;
const out = Buffer.alloc(ow * oh * 3);
for (let oy = 0; oy < oh; oy++) {
  for (let ox = 0; ox < ow; ox++) {
    let sum = 0;
    for (let dy = 0; dy < SCALE; dy++) {
      for (let dx = 0; dx < SCALE; dx++) {
        const i = ((oy * SCALE + dy) * fw + ox * SCALE + dx) * CH;
        sum +=
          fullRaw[i] * 256 + fullRaw[i + 1] + fullRaw[i + 2] / 256 - 32768;
      }
    }
    const h = Math.max(0, Math.round(sum / (SCALE * SCALE) + 32768));
    const o = (oy * ow + ox) * 3;
    out[o] = (h >> 8) & 0xff;
    out[o + 1] = h & 0xff;
    out[o + 2] = 0;
  }
}
await sharp(out, { raw: { width: ow, height: oh, channels: 3 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(OUT_DIR, "kanto-heightmap.png"));

// Actual geographic bounds of the stitched image (snapped to the tile grid).
const meta = {
  zoom: ZOOM,
  width: ow,
  height: oh,
  west: tileXToLon(x0, ZOOM),
  east: tileXToLon(x1 + 1, ZOOM),
  north: tileYToLat(y0, ZOOM),
  south: tileYToLat(y1 + 1, ZOOM),
};
await writeFile(
  path.join(OUT_DIR, "kanto-heightmap.json"),
  JSON.stringify(meta, null, 2)
);
console.log("Done:", meta);
