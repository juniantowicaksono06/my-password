import Database from '@/src/database/database';
import TokenHandler from '@/src/shared/TokenHandler';
import Joi from "@hapi/joi";
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { encryptStringV2 } from '@/src/shared/function';


export async function POST(req: Request, res: Response) {
    try {
        const schema = Joi.object({
            otp: Joi.string().min(6).required().label("OTP Code"),
        });
        let body;
        try {
            body = await req.json();
        }
        catch(error) {
            body = {};
        }
        const data: {
            otp: string
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
        const verify = new TokenHandler();
        verify.init();
        if(await verify.validateOTP()) {
            const currentDate = new Date();
            const OTPPayload = verify.getOTPPayload();
            const dbMain = new Database('main');
            dbMain.initModel();
            const { loginOTPCollection, userCollection, userTokenCollection } = dbMain.getModels();
            const getOtp = await loginOTPCollection!.findOne({
                userID: OTPPayload!['userID'],
                otp: data['otp'],
                isActive: true,
                validUntil: {
                    $gt: currentDate
                }
            });
            if(getOtp == null || getOtp == undefined) {
                return Response.json({
                    code: 401,
                    message: "Invalid OTP"
                }, {
                    status: 401
                });
            }
            await loginOTPCollection!.updateMany({
                userID: OTPPayload!['userID'],
                otp: data['otp']
            }, {
                $set: {
                    isActive: false
                }
            });
            const user = await userCollection!.findOne({
                _id: OTPPayload!['userID']
            });

            const accessTokenValid = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
            const refreshTokenValid = Math.floor(Date.now() / 1000) + 2592000;
            const date2 = new Date(refreshTokenValid * 1000);
            currentDate.setDate(currentDate.getDate() + 30);
            const refreshTokenValidDate1 = currentDate.toDateString();
            const accessSecretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY as string);
            const refreshSecretKey = new TextEncoder().encode(process.env.JWT_REFRESH_KEY as string);

            const accessToken = await new SignJWT({
                userID: user!['_id'],
                fullname: user!['fullname'],
                email: user!['email'],
                userStatus: user!['userStatus'],
                picture: user!['picture'] == undefined ? "" : user!['picture']
            }).setProtectedHeader({
                alg: 'HS256',
                typ: 'JWT'
            })
            .setIssuedAt()
            .setExpirationTime('48h')
            .sign(accessSecretKey);
            const refreshToken = await new SignJWT({
                userID: user!['_id'],
                fullname: user!['fullname'],
                email: user!['email'],
                userStatus: user!['userStatus'],
                picture: user!['picture'] == undefined ? "" : user!['picture'],
            }).setProtectedHeader({
                alg: 'HS256',
                typ: 'JWT'
            })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(refreshSecretKey);

            await userTokenCollection!.create({
                token: refreshToken,
                userID: user!['_id'],
                validDate: refreshTokenValidDate1
            });

            cookies().set('accessToken', await encryptStringV2(accessToken), {
                httpOnly: true,
                secure: /^true$/i.test(process.env.USE_SECURE as string),
                path: '/',
                maxAge: 2 * 24 * 60 * 60
            });
            
            cookies().set('refreshToken', await encryptStringV2(refreshToken, process.env.REFRESH_KEY as string), {
                httpOnly: true,
                secure: /^true$/i.test(process.env.USE_SECURE as string),
                path: '/',
                maxAge: 30 * 24 * 60 * 60
            });
    
            cookies().set('otpAccess', "", {
                httpOnly: true,
                secure: /^true$/i.test(process.env.USE_SECURE as string),
                path: '/',
                maxAge: -1
            });

            return Response.json({
                code: 200,
                message: "OTP Verified"
            }, {
                status: 200
            });
        }
        else {
            return Response.json({
                code: 401,
                message: "Invalid OTP"
            }, {
                status: 401
            });
        }
    } catch (error) {
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}