import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Finding 2 — HTTP security headers
// 'unsafe-eval' is required in development: Next.js webpack + React Fast Refresh use eval()
// for source maps and hot-module replacement. It is intentionally omitted in production.
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self' https://openrouter.ai",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { dev }) => {
    // Keep module paths as the in-project (junctioned) location instead of
    // resolving to their real target. Required because setup-local-cache.ps1
    // relocates node_modules to a junction outside OneDrive (possibly on
    // another drive); without this, webpack emits broken "./C:/..." specifiers.
    config.resolve.symlinks = false;
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
