
import { ConnectDB, userTokenCollection } from "@/src/database";
import Joi from "@hapi/joi";
import jwt from 'jsonwebtoken';


export async function POST(req: Request, res: Response) {

    const schema = Joi.object({
        refreshToken: Joi.string().required().label("Refresh Token")
    })
    let data: {
        refreshToken: string
    } = await req.json();

    const {error, value} = schema.validate(data)
    if (error) {
        return Response.json({
            code: 400,
            message: error.details.map(i => i.message).join(',')
        }, {
            status: 400
        });
    }
    try {
        await ConnectDB();
        const refreshTokenDB = await userTokenCollection.findOne({
            token: data['refreshToken']
        });
        if(refreshTokenDB) {
            var accessToken = "";
            jwt.verify(data['refreshToken'], process.env.JWT_REFRESH_KEY as string, (err, tokenDetails) => {
                if(err) {
                    return Response.json({
                        code: 403,
                        message: "Refresh token is invalid"
                    }, {
                        status: 200
                    });
                }
                const details = tokenDetails as {
                    exp: number,
                    data: {
                        username: string,
                        fullname: string,
                        userStatus: number,
                        picture?: string
                    }
                };
                accessToken = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
                    data: {...details['data']}
                }, process.env.JWT_SECRET_KEY as string);
                
            });
            return Response.json({
                code: 200,
                data: {
                    accessToken: accessToken
                },
                message: "Refresh token is valid"
            }, {
                status: 200
            });
        }
        else {
            return Response.json({
                code: 404,
                message: "Refresh token is invalid"
            }, {
                status: 200
            });
        }
    }
    catch (error) {
        let message = ""
        if(error instanceof Error) {
            message = error.message
        }
        else {
            message = "Unknown server error"
        }
        return Response.json({
            code: 500,
            message: message
        }, {
            status: 500
        })
    }
}