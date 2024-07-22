
import Joi from "@hapi/joi";
import axios from 'axios';
// import {ConnectDB, userCollection, userTokenCollection} from "@/src/database";
import Database from "@/src/database/database";
import { cookies } from 'next/headers';
import {Types} from 'mongoose';
import { SignJWT } from 'jose';
import { encryptStringV2, generateOTP } from "@/src/shared/function";
import Email from "@/src/shared/Email";
import Cryptography from "@/src/shared/Cryptography";

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
            // await ConnectDB();
            const dbMain = new Database("main");
            dbMain.initModel();
            const {userCollection, userTokenCollection, loginOTPCollection} = dbMain.getModels();
            const userProfile = userProfileResponse.data;
            const user = await userCollection!.findOne({
                email: userProfile['email']
            });
            var insertedId: Types.ObjectId;
            if(!user) {
                let inserted = await userCollection!.create({
                    fullname: userProfile.name,
                    picture: userProfile.picture,
                    email: userProfile.email,
                    userStatus: 1,
                    userCreatedType: 'oauth-google'
                });
                insertedId = inserted._id;
                const dbKeys = new Database();
                dbKeys.createConnection('keys').initModel();
                const { userKeysCollection } = dbKeys.getModels();
                const myCrypto = new Cryptography();
                myCrypto.generateNewPair();

                await userKeysCollection?.create({
                    userID: user!._id,
                    publicKey: await encryptStringV2(myCrypto.getPublicKey(), process.env.USER_PUBLIC_KEY as string),
                    privateKey: await encryptStringV2(myCrypto.getPrivateKey(), process.env.USER_PRIVATE_KEY as string)
                })
            }
            else {
                insertedId = user['_id'];
            }

            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 30);
            const otpSecretKey = new TextEncoder().encode(process.env.JWT_OTP as string);
            
            

            const otpCode = generateOTP();
            
            // Set every otp as invalid for the current logged in user
            await loginOTPCollection!.updateMany({
                userID: user!['_id']
            }, {
                $set: {
                    isActive: false
                }
            });

            await loginOTPCollection!.create({
                userID: user!['_id'],
                otp: otpCode,
                validUntil: currentDate.toDateString(),
                isActive: true
            })

            const otpAccess = await new SignJWT({
                userID: user!['_id']
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
                email.sendEmail(user!.email as string, `Hello, ${user!.fullname}`, "", `Here is your OTP Code to login: ${otpCode}`);
            } catch (error) {
                
            }

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