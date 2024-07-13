import Joi from "@hapi/joi";
import  Boom from "@hapi/boom";
import { ConnectDB, userCollection } from '@/src/database/index';
import Email from "@/src/shared/Email";
import { generateToken } from '@/src/shared/function';
import moment from "moment";

import {hash, compare, genSaltSync} from 'bcrypt'

/**
 * Registers a new user by validating the provided data against a Joi schema and checking if the username or email already exists in the database.
 * If the data is valid and the username/email is available, the user is registered and a success message is returned.
 * If the data is invalid, a 400 Bad Request response is returned with a message indicating the validation errors.
 * If the username or email already exists, a 409 Conflict response is returned with a message indicating which field is already taken.
 * If an error occurs during the registration process, a 500 Internal Server Error response is returned with a debug message.
 *
 * @param {Request} req - The HTTP request object containing the user data to be registered.
 * @param {Response} res - The HTTP response object used to send the registration result.
 * @return {Promise<void>} A promise that resolves when the registration is complete and the response is sent.
 */
export async function POST(req: Request, res: Response) {
    try {
        const schema = Joi.object({
            fullname: Joi.string().required().label("Full Name"),
            email: Joi.string().required().label("Email"),
            password: Joi.string().required().label("Password"),
            picture: Joi.string().optional().label("Picture")
        })
        // let formData = await req.formData();
        try {
            var data = await req.json() as Partial<Forms.IUserData>
        }
        catch(error) {
            return Response.json({
                code: 400,
                message: "No input provided"
            });
        }
        const {error, value} = schema.validate(data)
        if (error) {
            return Response.json({
                "code": 400,
                "message": error.details.map(i => i.message).join(',')
            });
        }
        await ConnectDB()
        const user = await userCollection.findOne({
            email: data['email']
        })
        if(user) {
            let message = "";
            if(user['email'] == data['email']) {
                message = "Email address has been taken"
            }
            return Response.json({
                code: 409,
                message: message
            }, {
                status: 200
            })
        }
        const salt = genSaltSync(10)
        const hashPassword = await hash(data['password'] as (string | Buffer), salt)
        // Get current date
        let currentDate = new Date();

        // Add 30 minutes to the current date
        currentDate.setMinutes(currentDate.getMinutes() + 30);
        let activationExpired = moment(currentDate)

        // Format the date as "Year-Month-Date Hour:Minute:Second"
        // let formattedDate = currentDate.toISOString().replace(/T|Z/g, ' ').trim();
        data['password'] = hashPassword
        let insertData: Partial<Forms.IUserData> = {
            email: data['email'],
            password: data['password'],
            fullname: data['fullname'],
            userStatus: 2,
            userActivationToken: generateToken(),
            userActivationTokenValidDate: activationExpired.toDate(),
            userResetToken: "",
            picture: data['picture']
        }
        if(Object.keys(data).includes("picture")) {
            insertData['picture'] = data['picture']
        }
        await userCollection.create({
            ...insertData,
            userStatus: 0,
            userCreatedType: 'regular'
        })
        // Sending Email
        try {
            const email = new Email();
            email.init();
            email.sendEmail(data.email as string, `Hello, ${data.fullname}`, "", `Please click on the link below to activate your account. <a href="${process.env.APP_BASE_URL as string}/auth/activate/${insertData.userActivationToken}">Activate</a>`);
        } catch (error) {
            
        }
        return Response.json({
            code: 201,
            message: "Successfully registered. Please check your email for verification",
        })
    }
    catch(error) {
        return Response.json({
            code: 500,
            message: "Internal server error",
            debugMessage: error
        })
    }

}