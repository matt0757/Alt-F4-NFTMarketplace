// src/config/constants.ts
export const MARKETPLACE_CONFIG = {
  PACKAGE_ID: "0xe4eb79c00345cf1d1ceb3b62d0513a2d3ef3099155d7469ef6b5ef56564c27e5",
  MARKETPLACE_ID: "0xcabbe41aaa5878a150ede77362655f3814f20ae9499a9d1bb2b88f0e255a4e9a", 
  ADMIN_CAP_ID: "0xe9eb66ee1e6dba9a7d9779afafcd76e078b9180dea2d3df6db6fe9a5a50bb598",
  NETWORK: "testnet" as const
};

export const ENOKI_CONFIG = {
  API_KEY: import.meta.env.VITE_ENOKI_API_KEY || "",
  NETWORK: "testnet" as const
};

export const SUI_CLIENT_CONFIG = {
  url: import.meta.env.DEV ? "/api/sui" : "https://fullnode.testnet.sui.io:443"
};