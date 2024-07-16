import { NextRequest, NextResponse } from "next/server";
import {ConnectDB, passwordsCollection} from "@/src/database";
import { encryptStringV2, decryptStringV2 } from "@/src/shared/function";
import Joi from "@hapi/joi";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const url = req.url;
        const urlSplit = url.split('/');
        const id = urlSplit[urlSplit.length - 1];
        if(id.length < 24) {
            return Response.json({
                code: 404,
                message: "ID is less than 24 characters"
            }, {
                status: 200
            });
        }
        await ConnectDB();
        const myPasswords = await passwordsCollection.findOne({
            _id: id
        });
        if(myPasswords === null) {
            return Response.json({
                code: 404,
                message: "Password not found"
            }, {
                status: 200
            });
        }
        let decryptedPassword = await decryptStringV2(myPasswords['password'] as string, `${process.env.PASSWORD_SECRET}_${process.env.PASSWORD_SECRET_SALT}`);
        let password = decryptedPassword!.replace(`${process.env.SALT_KEY as string}_`, "");
        return Response.json({
            code: 200,
            data: {
                decryptedPassword: password
            }
        }, {
            status: 200
        });
    } catch (error) {
        return Response.json({
            code: 500,
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}

export async function DELETE(req: NextRequest, res: NextResponse) {
    try {
        const url = req.url;
        const urlSplit = url.split('/');
        const id = urlSplit[urlSplit.length - 1];
        if(id.length < 24) {
            return Response.json({
                code: 404,
                message: "ID is less than 24 characters"
            }, {
                status: 200
            });
        }
        await ConnectDB();
        await passwordsCollection.deleteOne({
            _id: id
        })

        return Response.json({
            code: 200,
            message: "Password deleted successfully"
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


export async function PUT(req: NextRequest, res: NextResponse) {
    try {
        const url = req.url;
        const urlSplit = url.split('/');
        const id = urlSplit[urlSplit.length - 1];
        if(id.length < 24) {
            return Response.json({
                code: 404,
                message: "ID is less than 24 characters"
            }, {
                status: 200
            });
        }
        const schema = Joi.object({
            title: Joi.string().min(2).required().label("Title"),
            user: Joi.string().min(2).required().label("User"),
            url: Joi.string().optional().label("URL"),
            itemType: Joi.string().optional().label("Type"),
            password: Joi.string().required().min(4).max(64).label("Password")
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
        await passwordsCollection.findByIdAndUpdate(id, {
            title: data['title'],
            user:  data['user'],
            url: data['url'],
            itemType: data['itemType'],
            password: await encryptStringV2(`${process.env.SALT_KEY}_${data['password'] as string}`, `${process.env.PASSWORD_SECRET}_${process.env.PASSWORD_SECRET_SALT}`),
            userID: userData.userID
        });
        return Response.json({
            code: 200,
            message: "Password updated successfully",
            payloadData: data
        }, {
            status: 200
        });
    } catch (error) {
        return Response.json({
            code: 500,
            message: "Internal Server Error"
        }, {
            status: 500
        });
    }
}