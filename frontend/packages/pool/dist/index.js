import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CBCIZHUC42CKOZHKKEYMSXVVY24ZK2EKEUU6NFGQS5YFG7GAMEU5L32M",
    }
};
/**
 * Errors for the TrustBridge Oracle contract
 */
export const OracleError = {
    /**
     * Contract has already been initialized
     */
    1: { message: "AlreadyInitialized" },
    /**
     * Caller is not authorized to perform this action
     */
    2: { message: "Unauthorized" },
    /**
     * Invalid price provided (must be > 0)
     */
    3: { message: "InvalidPrice" },
    /**
     * Invalid input parameters
     */
    4: { message: "InvalidInput" },
    /**
     * Price not found for the requested asset
     */
    5: { message: "PriceNotFound" },
    /**
     * Contract is not initialized
     */
    6: { message: "NotInitialized" }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAABAAAACpFcnJvcnMgZm9yIHRoZSBUcnVzdEJyaWRnZSBPcmFjbGUgY29udHJhY3QAAAAAAAAAAAALT3JhY2xlRXJyb3IAAAAABgAAACVDb250cmFjdCBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAQAAAC9DYWxsZXIgaXMgbm90IGF1dGhvcml6ZWQgdG8gcGVyZm9ybSB0aGlzIGFjdGlvbgAAAAAMVW5hdXRob3JpemVkAAAAAgAAACRJbnZhbGlkIHByaWNlIHByb3ZpZGVkIChtdXN0IGJlID4gMCkAAAAMSW52YWxpZFByaWNlAAAAAwAAABhJbnZhbGlkIGlucHV0IHBhcmFtZXRlcnMAAAAMSW52YWxpZElucHV0AAAABAAAACdQcmljZSBub3QgZm91bmQgZm9yIHRoZSByZXF1ZXN0ZWQgYXNzZXQAAAAADVByaWNlTm90Rm91bmQAAAAAAAAFAAAAG0NvbnRyYWN0IGlzIG5vdCBpbml0aWFsaXplZAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAY=",
            "AAAAAQAAAAAAAAAAAAAACVByaWNlRGF0YQAAAAAAAAIAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAJdGltZXN0YW1wAAAAAAAABg==",
            "AAAAAgAAAAAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR",
            "AAAAAAAAAAAAAAAEaW5pdAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAAJc2V0X3ByaWNlAAAAAAAAAgAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAA",
            "AAAAAAAAAAAAAAAJbGFzdHByaWNlAAAAAAAAAQAAAAAAAAAFYXNzZXQAAAAAAAfQAAAABUFzc2V0AAAAAAAAAQAAA+gAAAfQAAAACVByaWNlRGF0YQAAAA==",
            "AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAAKc2V0X3ByaWNlcwAAAAAAAgAAAAAAAAAGYXNzZXRzAAAAAAPqAAAH0AAAAAVBc3NldAAAAAAAAAAAAAAGcHJpY2VzAAAAAAPqAAAACwAAAAA=",
            "AAAAAAAAAAAAAAAFYWRtaW4AAAAAAAAAAAAAAQAAABM=",
            "AAAAAAAAAAAAAAAJc2V0X2FkbWluAAAAAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA="]), options);
        this.options = options;
    }
    fromJSON = {
        init: (this.txFromJSON),
        set_price: (this.txFromJSON),
        lastprice: (this.txFromJSON),
        decimals: (this.txFromJSON),
        set_prices: (this.txFromJSON),
        admin: (this.txFromJSON),
        set_admin: (this.txFromJSON)
    };
}
