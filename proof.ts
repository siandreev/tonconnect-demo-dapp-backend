import {TonProof} from "./models";
import {db} from "./payload";
import * as crypto from 'crypto';
import * as nacl from 'tweetnacl';
import {tonapi} from "./tonapi";

const APP_DOMAIN = 'ton-connect.github.io';

export async function checkProof(tonProof: TonProof): Promise<boolean> {
    try {
        if (tonProof.proof.domain.value !== APP_DOMAIN) {
            return false;
        }

        if (!db.payloads.includes(tonProof.proof.payload)) {
            return false;
        }

        if (tonProof.proof.timestamp + 60 * 5 < Date.now() / 1000) {
            return false;
        }

        const response = await tonapi.connect.getAccountInfoByStateInit({state_init: tonProof.proof.state_init});

        if (response.address !== tonProof.address) {
            return false;
        }


        const tonProofPrefix = 'ton-proof-item-v2/';
        const tonConnectPrefix = 'ton-connect';

        const [wcString, hashString] = tonProof.address.split(':');
        const wc = Buffer.alloc(4);
        wc.writeInt32BE(Number(wcString));
        const hash = Buffer.from(hashString, 'hex');

        const domainLength = Buffer.alloc(4);
        domainLength.writeUint32LE(tonProof.proof.domain.lengthBytes);
        const domain = Buffer.from(tonProof.proof.domain.value);

        const timestamp = Buffer.alloc(8);
        timestamp.writeBigUint64LE(BigInt(tonProof.proof.timestamp));
        const payload = Buffer.from(tonProof.proof.payload);

        const msg = Buffer.concat([
            Buffer.from(tonProofPrefix),
            wc,
            hash,
            domainLength,
            domain,
            timestamp,
            payload
        ]);


        const msgHash = crypto.createHash('sha256').update(msg).digest();
        const finalMsg = Buffer.concat([
            Buffer.from([0xff, 0xff]),
            Buffer.from(tonConnectPrefix),
            msgHash
        ]);

        const finalMsgHash = crypto.createHash('sha256').update(finalMsg).digest();

        return nacl.sign.detached.verify(finalMsgHash, Buffer.from(tonProof.proof.signature, 'base64'), Buffer.from(response.public_key, 'hex'));
    } catch (e) {
        console.error(e);
        return false;
    }
}
