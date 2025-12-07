"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensService = void 0;
const ethers_1 = require("ethers");
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
function isValidENSName(name) {
    return /^[a-zA-Z0-9.-]+\.eth$/.test(name);
}
function isValidENSNameWithoutEth(name) {
    return /^[a-zA-Z0-9.-]+$/.test(name) && !name.includes('.');
}
function normalizeAddress(address) {
    return address.toLowerCase();
}
function normalizeENSName(name) {
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
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(PROVIDERS[0]);
    }
    async lookupENSName(address) {
        try {
            const normalizedAddress = normalizeAddress(address);
            const ensName = await this.provider.lookupAddress(normalizedAddress);
            return ensName ? normalizeENSName(ensName) : null;
        }
        catch (error) {
            return null;
        }
    }
    async lookupAddress(ensName) {
        try {
            const normalizedName = normalizeENSName(ensName);
            const address = await this.provider.resolveName(normalizedName);
            return address ? normalizeAddress(address) : null;
        }
        catch (error) {
            return null;
        }
    }
    async getENSProfile(ensName) {
        try {
            const normalizedName = normalizeENSName(ensName);
            const resolver = await this.provider.getResolver(normalizedName);
            if (!resolver)
                return null;
            const [address, avatar, url, twitter, github] = await Promise.all([
                this.lookupAddress(normalizedName),
                this.getTextRecord(resolver, 'avatar'),
                this.getTextRecord(resolver, 'url'),
                this.getTextRecord(resolver, 'com.twitter'),
                this.getTextRecord(resolver, 'com.github')
            ]);
            const response = {
                ens: normalizedName
            };
            if (address)
                response.address = address;
            if (avatar)
                response.avatar = avatar;
            if (url)
                response.url = url;
            if (twitter)
                response.twitter = twitter;
            if (github)
                response.github = github;
            return response;
        }
        catch (error) {
            return null;
        }
    }
    async getTextRecord(resolver, key) {
        try {
            return await resolver.getText(key);
        }
        catch {
            return null;
        }
    }
    async lookup(input) {
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
            }
            else {
                return { address: normalizeAddress(trimmedInput) };
            }
        }
        else if (isValidENSName(trimmedInput) || isValidENSNameWithoutEth(trimmedInput)) {
            const normalizedName = normalizeENSName(trimmedInput);
            const profile = await this.getENSProfile(normalizedName);
            if (profile) {
                const { ens, ...profileWithoutEns } = profile;
                return profileWithoutEns;
            }
            return null;
        }
        else {
            return null;
        }
    }
}
exports.ensService = new ENSService();
