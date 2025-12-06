import { ethers } from 'ethers';

interface ENSResponse {
  address?: string;
  ens?: string;
  avatar?: string;
  github?: string;
  url?: string;
  twitter?: string;
}

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isValidENSName(name: string): boolean {
  return /^[a-zA-Z0-9.-]+\.eth$/.test(name);
}

function isValidENSNameWithoutEth(name: string): boolean {
  return /^[a-zA-Z0-9.-]+$/.test(name) && !name.includes('.');
}

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

function normalizeENSName(name: string): string {
  const normalized = name.toLowerCase();
  if (isValidENSNameWithoutEth(normalized)) {
    return normalized + '.eth';
  }
  return normalized;
}

const PROVIDERS = [
  'https://eth.llamarpc.com',
  'https://rpc.ankr.com/eth',
  'https://ethereum-rpc.publicnode.com'
];

class ENSService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(PROVIDERS[0]);
  }

  async lookupENSName(address: string): Promise<string | null> {
    try {
      const normalizedAddress = normalizeAddress(address);
      const ensName = await this.provider.lookupAddress(normalizedAddress);
      return ensName ? normalizeENSName(ensName) : null;
    } catch (error) {
      console.error('Error looking up ENS name:', error);
      return null;
    }
  }

  async lookupAddress(ensName: string): Promise<string | null> {
    try {
      const normalizedName = normalizeENSName(ensName);
      const address = await this.provider.resolveName(normalizedName);
      return address ? normalizeAddress(address) : null;
    } catch (error) {
      console.error('Error looking up address:', error);
      return null;
    }
  }

  async getENSProfile(ensName: string): Promise<ENSResponse | null> {
    try {
      const normalizedName = normalizeENSName(ensName);
      const resolver = await this.provider.getResolver(normalizedName);
      
      if (!resolver) return null;

      const [address, avatar, url, twitter, github] = await Promise.all([
        this.lookupAddress(normalizedName),
        this.getTextRecord(resolver, 'avatar'),
        this.getTextRecord(resolver, 'url'),
        this.getTextRecord(resolver, 'com.twitter'),
        this.getTextRecord(resolver, 'com.github')
      ]);

      const response: ENSResponse = {
        ens: normalizedName
      };

      if (address) response.address = address;
      if (avatar) response.avatar = avatar;
      if (url) response.url = url;
      if (twitter) response.twitter = twitter;
      if (github) response.github = github;

      return response;
    } catch (error) {
      console.error('Error getting ENS profile:', error);
      return null;
    }
  }

  private async getTextRecord(resolver: ethers.EnsResolver, key: string): Promise<string | null> {
    try {
      return await resolver.getText(key);
    } catch {
      return null;
    }
  }

  async lookup(input: string): Promise<ENSResponse | null> {
    const trimmedInput = input.trim();
    
    if (isValidEthereumAddress(trimmedInput)) {
      const ensName = await this.lookupENSName(trimmedInput);
      
      if (ensName) {
        const profile = await this.getENSProfile(ensName);
        if (profile) {
          const { address, ...profileWithoutAddress } = profile;
          return profileWithoutAddress;
        }
        return { ens: ensName };
      } else {
        return { address: normalizeAddress(trimmedInput) };
      }
    } else if (isValidENSName(trimmedInput) || isValidENSNameWithoutEth(trimmedInput)) {
      const normalizedName = normalizeENSName(trimmedInput);
      const profile = await this.getENSProfile(normalizedName);
      if (profile) {
        const { ens, ...profileWithoutEns } = profile;
        return profileWithoutEns;
      }
      return null;
    } else {
      return null;
    }
  }
}

export const ensService = new ENSService();
export type { ENSResponse };