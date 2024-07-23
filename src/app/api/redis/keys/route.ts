import RedisClient from '@/src/database/redis';
import Joi from '@hapi/joi';


export async function POST(req: Request, res: Response) {
    
    const schema = Joi.object({
        key: Joi.string().required().label("Key"),
        value: Joi.string().required().label("Value")
    });
    let body;
    try {
        body = await req.json();
    }
    catch(error) {
        body = {};
    }
    const data: {
        key: string,
        value: string
    } = body;
    const {error} = schema.validate(data);
    if (error) {
        return Response.json({
            code: 401,
            message: error.message
        }, {
            status: 401
        });
    }
    try {
        const client = RedisClient();
        await client.set(data['key'], data['value'], {
            EX: 60
        });
        return Response.json({
            code: 200,
            message: "OK"
        }, {
            status: 200
        });
    } catch (error) {
        console.error(error)
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}