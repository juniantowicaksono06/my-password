import Database from '@/src/database/database';
import TokenHandler from '@/src/shared/TokenHandler';
import { generateOTP } from '@/src/shared/function';
import Email from '@/src/shared/Email';


export async function POST(req: Request, res: Response) {
    try {
        const verify = new TokenHandler();
        verify.init();
        if(await verify.validateOTP()) {
            const OTPPayload = verify.getOTPPayload();
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 30);
            const otpSecretKey = new TextEncoder().encode(process.env.JWT_OTP as string);
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
                const email = new Email();
                email.init();
                email.sendEmail(user!.email as string, `Hello, ${user!.fullname}`, "", `Here is your OTP Code to login: ${otpCode}`);
            } catch (error) {
                
            }

            return Response.json({
                code: 200,
                message: "OTP Send to your email"
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