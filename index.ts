import * as express from 'express';
import * as cors from 'cors';
import {db, generatePayload} from "./payload";
import {TonProof} from "./models";
import {checkProof} from "./proof";
import * as jsonwebtoken from 'jsonwebtoken';
import {NextFunction, Request, Response} from "express";

const app = express();
app.use(cors());
app.use(express.json());

const recreatePayloadFrequency = 1000 * 60 * 10;
const backendSecret = 'MY_SECRET_FROM_ENV';

app.post('/ton-proof/generatePayload', (req, res) => {
    const payload = generatePayload();
    db.payloads.push(payload);

    setTimeout(() => {
        db.payloads = db.payloads.filter(p => p !== payload);
    }, recreatePayloadFrequency);

    res.json({payload});
})

app.post('/ton-proof/checkProof', async (req, res) => {
    const tonProof = req.body as TonProof;
    const isValid = await checkProof(tonProof)

    if (isValid) {
        const token = jsonwebtoken.sign(tonProof.address, backendSecret);
        res.json({token});
    } else {
        res.status(400).send('Wrong proof');
    }
})

async function checkJWT(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        res.sendStatus(401);
        return;
    }

    jsonwebtoken.verify(token, backendSecret, (err, decoded) => {
        if (err) {
            res.sendStatus(401);
        }

        (req as unknown as {  userAddress: string}).userAddress = decoded as string;

        next();
    })
}

app.get('/dapp/getAccountInfo',
    checkJWT,
    async (req, res) => {

    res.json({ address: (req as unknown as {  userAddress: string}).userAddress });

})

app.listen(3000);



