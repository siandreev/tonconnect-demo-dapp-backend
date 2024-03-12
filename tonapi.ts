import {Api, HttpClient} from "@ton-api/client";

const httpClient = new HttpClient({
    baseUrl: 'https://tonapi.io',
    baseApiParams: {
        headers: {
            Authorization: `Bearer AGI2S5NMZM573CAAAAAA7H6N3CDNHKCHIKNBGJ3D2RSAJPHJCDZ2R3VZPGGMIAOSEEZ4CGI`,
            'Content-type': 'application/json'
        }
    }
});

export const tonapi = new Api(httpClient);
