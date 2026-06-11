import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // StrictMode's dev-only double-mount force-loses the R3F WebGL context on
  // the hero terrain canvas (@react-three/fiber 9.x + React 19), leaving it
  // permanently blank in dev. Production builds are unaffected either way.
  reactStrictMode: false,
};

export default nextConfig;
