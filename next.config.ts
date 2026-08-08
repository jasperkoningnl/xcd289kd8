import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * De site stond eerst zonder taalprefix online. Die adressen blijven
   * bestaan als permanente verwijzing naar de Nederlandse versie.
   */
  async redirects() {
    return [
      { source: "/stuk/:slug", destination: "/nl/stuk/:slug", permanent: true },
      { source: "/colofon", destination: "/nl/colofon", permanent: true },
    ];
  },
};

export default nextConfig;
