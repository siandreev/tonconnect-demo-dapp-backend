export interface TonProof {
    address: string,
    network: '-239' | '-3',
    proof: {
        timestamp: number;
        domain: {
            lengthBytes: number;
            value: string;
        };
        payload: string;
        signature: string;
        state_init: string
    }
}
