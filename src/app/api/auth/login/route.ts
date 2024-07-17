import { cookies } from 'next/headers';
import Joi from "@hapi/joi";
import NextCrypto from 'next-crypto';
import { ConnectDB, userCollection, userTokenCollection } from '@/src/database';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose';
import { encryptStringV2 } from '@/src/shared/function';

/**
 * Handles the POST request for user login, validates user credentials, generates access and refresh tokens, and sets cookies.
 *
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @return {void}
 */
export async function POST(req: Request, res: Response) {
    const schema = Joi.object({
        email: Joi.string().required().label("Email"),
        password: Joi.string().required().label("Password")
    });
    let body;
    try {
        body = await req.json();
    }
    catch(error) {
        body = {};
    }
    const data: Partial<Forms.IUserData> = body;
    const {error} = schema.validate(data);
    if (error) {
        return Response.json({
            code: 401,
            message: error.message
        }, {
            status: 401
        });
    }
    let result: {
        code?: number;
        message?: string;
        data?: {
            accessToken: string;
            refreshToken: string;
        }
    } = {};
    try {
        await ConnectDB();
        const user = await userCollection.findOne({
            email: data['email']
        })
        if(user) {
            if(user['userStatus'] != 1) {
                return Response.json({
                    code: 403,
                    message: "User is not active"
                }, {
                    status: 200
                });
            }
            if(await compare(data['password'] as string, user['password'] as string)) {

                const accessTokenValid = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
                const refreshTokenValid = Math.floor(Date.now() / 1000) + 2592000;
                const date2 = new Date(refreshTokenValid * 1000);
                // const refreshTokenValidDate1 = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, '0')}-${String(date2.getDate()).padStart(2, '0')} ${String(date2.getHours() + 1).padStart(2, '0')}:${String(date2.getMinutes() + 1).padStart(2, '0')}:${String(date2.getSeconds() + 1).padStart(2, '0')}`;
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 30);
                const refreshTokenValidDate1 = currentDate.toDateString();
                const accessSecretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY as string);
                const refreshSecretKey = new TextEncoder().encode(process.env.JWT_REFRESH_KEY as string);
                const accessToken = await new SignJWT({
                    userID: user['_id'],
                    fullname: user['fullname'],
                    email: user['email'],
                    userStatus: user['userStatus'],
                    picture: user['picture'] == undefined ? "" : user['picture']
                }).setProtectedHeader({
                    alg: 'HS256',
                    typ: 'JWT'
                })
                .setIssuedAt()
                .setExpirationTime('24h')
                .sign(accessSecretKey);
                const refreshToken = await new SignJWT({
                    userID: user['_id'],
                    fullname: user['fullname'],
                    email: user['email'],
                    userStatus: user['userStatus'],
                    picture: user['picture'] == undefined ? "" : user['picture'],
                }).setProtectedHeader({
                    alg: 'HS256',
                    typ: 'JWT'
                })
                .setIssuedAt()
                .setExpirationTime('30d')
                .sign(refreshSecretKey);

                await userTokenCollection.create({
                    token: refreshToken,
                    userID: user['_id'],
                    validDate: refreshTokenValidDate1
                });
                cookies().set('accessToken', await encryptStringV2(accessToken), {
                    httpOnly: true,
                    secure: /^true$/i.test(process.env.USE_SECURE as string),
                    path: '/',
                    maxAge: 1 * 24 * 60 * 60
                });
                
                cookies().set('refreshToken', await encryptStringV2(refreshToken, process.env.REFRESH_KEY as string), {
                    httpOnly: true,
                    secure: /^true$/i.test(process.env.USE_SECURE as string),
                    path: '/',
                    maxAge: 30 * 24 * 60 * 60
                });

                result = {
                    code: 200,
                    message: "Login successfully",
                    data: {
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    }
                };
            }
            else {
                result = {
                    code: 403,
                    message: "Invalid email or password"
                };
            }
        }
        else {
            result = {
                code: 403,
                message: "Invalid email or password"
            }
        }
        return Response.json(result, {
            status: 200
        })
    }
    catch(error) {
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}

