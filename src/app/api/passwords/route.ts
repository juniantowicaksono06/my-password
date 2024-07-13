import { ConnectDB, passwordsCollection } from "@/src/database";
import { NextRequest, NextResponse } from "next/server";
import Joi from "@hapi/joi";
import { encryptStringV2 } from "@/src/shared/function";

export async function GET(req: Request, res: Response) {
    try {
        const userDataJSON = req.headers.get('x-user-data') as string;
        const userData = JSON.parse(userDataJSON) as Forms.IPasswords;
        await ConnectDB();
        const myPasswords = await passwordsCollection.find({
            userID: userData.userID
        });

        return Response.json({
            code: 200,
            data: myPasswords
        }, {
            status: 200
        });
    }
    catch(error) {
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}

export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const schema = Joi.object({
            title: Joi.string().required().label("Title"),
            url: Joi.string().optional().label("Link"),
            itemType: Joi.string().optional().label("Type"),
            password: Joi.string().required().min(8).max(64).label("Password")
        });
        let body;
        try {
            body = await req.json();
        }
        catch(error) {
            body = {};
        }
        const data: Partial<Forms.IPasswords> = body;
        const {error} = schema.validate(data);
        if (error) {
            return Response.json({
                code: 401,
                message: error.message
            }, {
                status: 401
            });
        }
        const userDataJSON = req.headers.get('x-user-data') as string;
        const userData = JSON.parse(userDataJSON) as Forms.IPasswords;
        await ConnectDB();
        const passwordItem = new passwordsCollection({
            title: data['title'],
            url: data['url'],
            itemType: data['itemType'],
            password: await encryptStringV2(`${process.env.SALT_KEY}_${data['password'] as string}`, `${process.env.PASSWORD_SECRET}_${process.env.PASSWORD_SECRET_SALT}`),
            userID: userData.userID
        });
        const passwordSave = await passwordItem.save();

        return Response.json({
            code: 200,
            data: {
                id: passwordSave._id
            }
        }, {
            status: 200
        });
        
    }
    catch(error) {
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}