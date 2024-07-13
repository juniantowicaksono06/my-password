import { NextRequest, NextResponse } from "next/server";
import {ConnectDB, passwordsCollection} from "@/src/database";
import { decryptStringV2 } from "@/src/shared/function";

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
        let decryptedPassword = await decryptStringV2(myPasswords['password'], `${process.env.PASSWORD_SECRET}_${process.env.PASSWORD_SECRET_SALT}`);
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