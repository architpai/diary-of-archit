// One-off generator: downloads terrarium-encoded elevation tiles (Mapzen/AWS
// open data) and stitches them into heightmap PNGs used by the 3D hero.
// Elevation stays RGB-encoded; the shader decodes h = (R*256 + G) - 32768.
//
// Usage: node scripts/fetch-terrain.mjs [region ...]   (default: all regions)

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Each region becomes <name>-heightmap.png/json in public/terrain/.
const REGIONS = [
  {
    // The Tokaido corridor: Kobe and Osaka Bay in the west, past Mt. Fuji,
    // to Tokyo Bay and the Boso peninsula in the east.
    name: "tokaido",
    zoom: 9,
    scale: 2,
    bounds: { west: 134.65, east: 140.55, south: 34.2, north: 35.95 },
  },
  {
    // Mumbai inset: the peninsula, harbour and the Sanjay Gandhi hills.
    name: "mumbai",
    zoom: 10,
    scale: 1,
    bounds: { west: 72.55, east: 73.25, south: 18.72, north: 19.42 },
  },
];
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

async function buildRegion({ name, zoom, scale, bounds }) {
  const x0 = lonToTileX(bounds.west, zoom);
  const x1 = lonToTileX(bounds.east, zoom);
  const y0 = latToTileY(bounds.north, zoom);
  const y1 = latToTileY(bounds.south, zoom);

  const cols = x1 - x0 + 1;
  const rows = y1 - y0 + 1;
  console.log(`[${name}] Fetching ${cols}x${rows} tiles at z${zoom}...`);

  const composites = [];
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const url = TILE_URL(zoom, tx, ty);
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

  // Downsample by `scale` by averaging decoded heights (resizing the RGB
  // encoding directly would corrupt elevations at the R/G carry boundary),
  // then re-encode into R/G only — dropping terrarium's sub-meter B channel
  // noise roughly halves the PNG size.
  const fw = cols * TILE_SIZE;
  const fh = rows * TILE_SIZE;
  const ow = fw / scale;
  const oh = fh / scale;
  const out = Buffer.alloc(ow * oh * 3);
  for (let oy = 0; oy < oh; oy++) {
    for (let ox = 0; ox < ow; ox++) {
      let sum = 0;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const i = ((oy * scale + dy) * fw + ox * scale + dx) * CH;
          sum +=
            fullRaw[i] * 256 + fullRaw[i + 1] + fullRaw[i + 2] / 256 - 32768;
        }
      }
      const h = Math.max(0, Math.round(sum / (scale * scale) + 32768));
      const o = (oy * ow + ox) * 3;
      out[o] = (h >> 8) & 0xff;
      out[o + 1] = h & 0xff;
      out[o + 2] = 0;
    }
  }
  await sharp(out, { raw: { width: ow, height: oh, channels: 3 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, `${name}-heightmap.png`));

  // Actual geographic bounds of the stitched image (snapped to the tile grid).
  const meta = {
    zoom,
    width: ow,
    height: oh,
    west: tileXToLon(x0, zoom),
    east: tileXToLon(x1 + 1, zoom),
    north: tileYToLat(y0, zoom),
    south: tileYToLat(y1 + 1, zoom),
  };
  await writeFile(
    path.join(OUT_DIR, `${name}-heightmap.json`),
    JSON.stringify(meta, null, 2)
  );
  console.log(`[${name}] Done:`, meta);
}

await mkdir(OUT_DIR, { recursive: true });
const wanted = process.argv.slice(2);
const regions = wanted.length
  ? REGIONS.filter((r) => wanted.includes(r.name))
  : REGIONS;
if (!regions.length) {
  throw new Error(
    `No matching regions. Available: ${REGIONS.map((r) => r.name).join(", ")}`
  );
}
for (const region of regions) await buildRegion(region);
