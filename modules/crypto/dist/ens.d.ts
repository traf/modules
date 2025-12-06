interface ENSResponse {
    address?: string;
    ens?: string;
    avatar?: string;
    github?: string;
    url?: string;
    twitter?: string;
}
declare class ENSService {
    private provider;
    constructor();
    lookupENSName(address: string): Promise<string | null>;
    lookupAddress(ensName: string): Promise<string | null>;
    getENSProfile(ensName: string): Promise<ENSResponse | null>;
    private getTextRecord;
    lookup(input: string): Promise<ENSResponse | null>;
}
export declare const ensService: ENSService;
export type { ENSResponse };
