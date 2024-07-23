import { pathname } from 'next-extra/pathname';
import RedisClient from '@/src/database/redis';

export async function GET(req: Request, res: Response) {
    try {
        let keyName = pathname().split('/')[4];
        const client = RedisClient();
        let value = await client.get(keyName);
        let ttl = await client.ttl(keyName);
        let code = 200;
        if(value == null) {
            value = "Key not found";
            code = 404;
        }
        return Response.json({
            code: code,
            message: "OK",
            data: {
                value: value,
                ttl: ttl
            }
        }, {
            status: 200
        })
    }
    catch(error) {
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}