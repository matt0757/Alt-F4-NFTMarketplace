// src/config/constants.ts
export const MARKETPLACE_CONFIG = {
  PACKAGE_ID: "0x05fbfd41840cf36971756bc6831d8af3ec8fdbf40e1202989b32f61391bc89db",
  MARKETPLACE_ID: "0xb3388dcfdf7d14faf94bec7b75e20d74dac9faf9bc81a4760f54582c8b2d93c4", 
  ADMIN_CAP_ID: "0x7ad696f41f9fe8d10d6cc332f314daec47cf13fe1708549336173eaa1e9b1b50",
  NETWORK: "testnet" as const
};

export const ENOKI_CONFIG = {
  API_KEY: import.meta.env.VITE_ENOKI_API_KEY || "",
  NETWORK: "testnet" as const
};

export const SUI_CLIENT_CONFIG = {
  url: import.meta.env.DEV ? "/api/sui" : "https://fullnode.testnet.sui.io:443"
};