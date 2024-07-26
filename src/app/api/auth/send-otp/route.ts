import Database from '@/src/database/database';
import TokenHandler from '@/src/shared/TokenHandler';
import { generateOTP } from '@/src/shared/function';
import Email from '@/src/shared/Email';
import RedisClient from '@/src/database/redis';


export async function POST(req: Request, res: Response) {
    try {
        const verify = new TokenHandler();
        verify.init();
        if(await verify.validateOTP()) {
            const OTPPayload = verify.getOTPPayload();
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 30);
            const otpCode = generateOTP();

            
            const dbMain = new Database('main');
            dbMain.initModel();
            const { loginOTPCollection, userCollection } = dbMain.getModels();

            await loginOTPCollection!.updateMany({
                userID: OTPPayload!['userID'],
            }, {
                $set: {
                    isActive: false
                }
            });

            await loginOTPCollection!.create({
                userID: OTPPayload!['userID'],
                otp: otpCode,
                validUntil: currentDate.toDateString(),
                isActive: true
            })

            
            const user = await userCollection!.findOne({
                _id: OTPPayload!['userID']
            })

            try {
                const environment = process.env.ENV;
                const email = new Email();
                const client = RedisClient();
                await client.set(`otp_${environment}_${user!._id}`, "OTP", {
                    EX: 60
                });
                email.init();
                await email.sendEmail(user!.email as string, `Hello, ${user!.fullname}`, "", `Here is your OTP Code to login: ${otpCode}`);
            } catch (error) {
                
            }

            return Response.json({
                code: 200,
                message: "An OTP code was succesfully send to your email!"
            }, {
                status: 200
            });
        }
        else {
            return Response.json({
                code: 401,
                message: "Failed to send OTP Code"
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