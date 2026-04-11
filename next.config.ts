import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fabric-network", "fabric-ca-client", "fabric-common", "fabric-protos"],
};

export default nextConfig;
