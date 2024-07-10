
import Joi from "@hapi/joi";
import axios from 'axios';
import {ConnectDB, userCollection, userTokenCollection} from "@/src/database";
import { cookies } from 'next/headers';
import {Types} from 'mongoose';
import jwt from 'jsonwebtoken';
import NextCrypto from 'next-crypto';

export async function POST(req: Request, res: Response) {
    const schema = Joi.object({
        code: Joi.string().required()
    })
    let data: {code: string} = await req.json();
        const {error, value} = schema.validate(data)
        if (error) {
            return Response.json({
                code: 400,
                message: error.details.map(i => i.message).join(',')
            }, {
                status: 400
            });
    }
    const url = process.env.GOOGLE_OAUTH_REDIRECT_URL as string
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID as string
    const clientSecret = process.env.GOOGLE_OAUTH_SECRET as string
    try {
        const result = await axios.post<{
            access_token: string,
            refresh_token: string,
            expires_in: string
        }>(`https://oauth2.googleapis.com/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=authorization_code&code=${data['code']}&redirect_uri=${url}`, {
            scopes: ["https://www.googleapis.com/auth/userinfo.profile"]
        })
        if(result.status == 200) {
            let { data } = result
            const userProfileResponse = await axios.get<{
                name: string,
                picture: string,
                email: string
            }>(`https://www.googleapis.com/oauth2/v2/userinfo`, {
                headers: {
                  Authorization: `Bearer ${data['access_token']}`
                }
            });
            await ConnectDB();
            const userProfile = userProfileResponse.data;
            const user = await userCollection.findOne({
                email: userProfile['email']
            });
            var insertedId: Types.ObjectId;
            if(!user) {
                let inserted = await userCollection.create({
                    fullname: userProfile.name,
                    picture: userProfile.picture,
                    email: userProfile.email,
                    userStatus: 1,
                    userCreatedType: 'oauth-google'
                });
                insertedId = inserted._id;
            }
            else {
                insertedId = user['_id'];
            }
            const accessTokenValid = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
            const refreshTokenValid = Math.floor(Date.now() / 1000) + 2592000;
            const date2 = new Date(refreshTokenValid * 1000);
            const refreshTokenValidDate1 = `${date2.getFullYear()}-${String(date2.getMonth() + 1).padStart(2, '0')}-${String(date2.getDate()).padStart(2, '0')} ${String(date2.getHours() + 1).padStart(2, '0')}:${String(date2.getMinutes() + 1).padStart(2, '0')}:${String(date2.getSeconds() + 1).padStart(2, '0')}`;
            const accessToken = jwt.sign({
                exp: accessTokenValid,
                data: {
                    fullname: userProfile['name'],
                    email: userProfile['email'],
                    userStatus: 1,
                    picture: userProfile['picture'] == undefined ? "" : userProfile['picture']
                },
            }, process.env.JWT_SECRET_KEY as string);
            const refreshToken = jwt.sign({
                exp: refreshTokenValid,
                data: {
                    fullname: userProfile['name'],
                    email: userProfile['email'],
                    userStatus: 1,
                    picture: userProfile['picture'] == undefined ? "" : userProfile['picture']
                },
            }, process.env.JWT_REFRESH_KEY as string);
            await userTokenCollection.create({
                token: refreshToken,
                userID: insertedId,
                validDate: refreshTokenValidDate1
            });
            const accessCrypto = new NextCrypto(process.env.SECRET_KEY as string);
            const refreshCrypto = new NextCrypto(process.env.REFRESH_KEY as string);
            cookies().set('accessToken', await accessCrypto.encrypt(accessToken), {
                httpOnly: true,
                secure: /^true$/i.test(process.env.USE_SECURE as string),
                path: '/',
                partitioned: /^true$/i.test(process.env.USE_SECURE as string),
                maxAge: 1 * 24 * 60 * 60,
                sameSite: 'strict'
            });
            
            cookies().set('refreshToken', await refreshCrypto.encrypt(refreshToken), {
                httpOnly: true,
                secure: /^true$/i.test(process.env.USE_SECURE as string),
                path: '/',
                partitioned: /^true$/i.test(process.env.USE_SECURE as string),
                maxAge: 30 * 24 * 60 * 60,
                sameSite: 'strict'
            });
            return Response.json({
                code: 200
            }, {
                status: 200
            });
        }
    }
    catch(error) {
        console.error(error)
        return Response.json({
            code: 500,
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}