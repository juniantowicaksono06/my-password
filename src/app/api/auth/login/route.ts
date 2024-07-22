import { cookies } from 'next/headers';
import Joi from "@hapi/joi";
// import { ConnectDB, userCollection, userTokenCollection, loginOTPCollection } from '@/src/database';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose';
import { encryptStringV2, generateOTP } from '@/src/shared/function';
import Database from '@/src/database/database';
import Email from '@/src/shared/Email';

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
        const dbMain = new Database('main');
        dbMain.initModel();
        const {userCollection, loginOTPCollection} = dbMain.getModels();
        // await ConnectDB();
        const user = await userCollection!.findOne({
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
                const currentDate = new Date();
                currentDate.setDate(currentDate.getDate() + 30);
                const otpSecretKey = new TextEncoder().encode(process.env.JWT_OTP as string);
                
                

                const otpCode = generateOTP();
                
                // Set every otp as invalid for the current logged in user
                await loginOTPCollection!.updateMany({
                    userID: user['_id']
                }, {
                    $set: {
                        isActive: false
                    }
                });

                await loginOTPCollection!.create({
                    userID: user['_id'],
                    otp: otpCode,
                    validUntil: currentDate.toDateString(),
                    isActive: true
                })

                const otpAccess = await new SignJWT({
                    userID: user['_id']
                }).setProtectedHeader({
                    alg: 'HS256',
                    typ: 'JWT'
                }).setIssuedAt()
                .setExpirationTime('24h')
                .sign(otpSecretKey);

                cookies().set('otpAccess', await encryptStringV2(otpAccess, process.env.OTP_KEY), {
                    httpOnly: true,
                    secure: /^true$/i.test(process.env.USE_SECURE as string),
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7
                });
                
                // Sending Email
                try {
                    const email = new Email();
                    email.init();
                    email.sendEmail(data.email as string, `Hello, ${user.fullname}`, "", `Here is your OTP Code to login: ${otpCode}`);
                } catch (error) {
                    
                }

                result = {
                    code: 200,
                    message: "An OTP code was succesfully send to your email!"
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
        console.error(error)
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        })
    }
}

