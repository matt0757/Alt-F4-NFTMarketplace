import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient } from '@mysten/sui.js/client';
import { User } from '../types';

const REDIRECT_URI = window.location.origin;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SUI_NETWORK = import.meta.env.VITE_SUI_NETWORK || 'testnet';

class ZkLoginService {
  private suiClient: SuiClient;
  private ephemeralKeyPair: Ed25519Keypair | null = null;

  constructor() {
    const rpcUrl = SUI_NETWORK === 'mainnet' 
      ? 'https://fullnode.mainnet.sui.io'
      : 'https://fullnode.testnet.sui.io';
    
    this.suiClient = new SuiClient({ url: rpcUrl });
  }

  async authenticate(provider: string): Promise<User> {
    try {
      if (!CLIENT_ID) {
        throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      }

      // Generate ephemeral key pair
      this.ephemeralKeyPair = new Ed25519Keypair();
      
      // Generate randomness
      const randomness = this.generateRandomness();
      
      // Get the ephemeral public key as a base64 string
      const ephemeralPublicKeyBase64 = this.ephemeralKeyPair.getPublicKey().toBase64();

      // Generate nonce - simplified version without zkLogin SDK
      const nonce = this.generateNonce(ephemeralPublicKeyBase64, randomness);

      // Store session data
      const privateKeyBase64 = btoa(String.fromCharCode(...this.ephemeralKeyPair.export().privateKey));
      sessionStorage.setItem('zklogin_ephemeral_key', privateKeyBase64);
      sessionStorage.setItem('zklogin_randomness', randomness);
      sessionStorage.setItem('zklogin_nonce', nonce);

      // Redirect to OAuth provider
      const authUrl = this.getAuthUrl(provider, nonce);
      window.location.href = authUrl;

      // This will never be reached due to redirect, but TypeScript needs a return
      return {} as User;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  private generateRandomness(): string {
    // Generate a random string for the zkLogin flow
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private generateNonce(publicKey: string, randomness: string): string {
    // Simplified nonce generation without zkLogin SDK
    // In production, this would use the actual zkLogin nonce generation
    const data = `${publicKey}_${randomness}_${Date.now()}`;
    return btoa(data).replace(/[+/=]/g, '').substring(0, 21);
  }

  private getAuthUrl(provider: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: nonce,
    });

    if (provider === 'google') {
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  async handleCallback(): Promise<User | null> {
    try {
      // Extract ID token from URL fragment
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const idToken = hashParams.get('id_token');

      if (!idToken) {
        return null;
      }

      // Retrieve stored session data
      const ephemeralKeyStr = sessionStorage.getItem('zklogin_ephemeral_key');
      const randomness = sessionStorage.getItem('zklogin_randomness');

      if (!ephemeralKeyStr || !randomness) {
        throw new Error('Missing session data');
      }

      // Reconstruct ephemeral key pair from base64 string
      const secretKey = Uint8Array.from(atob(ephemeralKeyStr), c => c.charCodeAt(0)).slice(0, 32); // Truncate to 32 bytes
      this.ephemeralKeyPair = Ed25519Keypair.fromSecretKey(secretKey);

      // Parse JWT to get user info
      const jwtPayload = this.parseJwt(idToken);
      
      // For now, use a placeholder address since full zkLogin proof generation
      // requires additional backend infrastructure
      const address = `0x${this.generateDeterministicAddress(jwtPayload.sub)}`;

      // Clear URL fragment
      window.history.replaceState(null, '', window.location.pathname);

      // Clear session storage
      sessionStorage.removeItem('zklogin_ephemeral_key');
      sessionStorage.removeItem('zklogin_randomness');
      sessionStorage.removeItem('zklogin_nonce');

      return {
        address,
        provider: 'google',
        email: jwtPayload.email,
        name: jwtPayload.name,
      };
    } catch (error) {
      console.error('Callback handling error:', error);
      return null;
    }
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to parse JWT:', error);
      return {};
    }
  }

  private generateDeterministicAddress(sub: string): string {
    // Generate a deterministic address from the Google sub claim
    // This is a simplified version - in production, you'd use the actual zkLogin address derivation
    let hash = 0;
    for (let i = 0; i < sub.length; i++) {
      const char = sub.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to hex and pad to 64 characters (32 bytes)
    const hexHash = Math.abs(hash).toString(16);
    return hexHash.padStart(64, '0');
  }
}

export const zkLoginService = new ZkLoginService();
