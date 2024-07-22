import { NextRequest, NextResponse } from "next/server";
import { encryptStringV2, decryptStringV2 } from "@/src/shared/function";
import Joi from "@hapi/joi";
import Database from "@/src/database/database";
import Forge from 'node-forge';


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
        // await ConnectDB();
        
        const dbMain = new Database('main');
        const dbKeys = new Database('keys');
        dbKeys.initModel();
        dbMain.initModel();
        const { passwordsCollection } = dbMain.getModels();
        await passwordsCollection!.deleteOne({
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
        // await ConnectDB();
        
        const dbMain = new Database('main');
        const dbKeys = new Database('keys');
        dbKeys.initModel();
        dbMain.initModel();
        const { passwordsCollection, userCollection } = dbMain.getModels();
        const { userKeysCollection } = dbKeys.getModels();

        const user = await userCollection!.findOne({
            _id: userData.userID
        });
        if(user == null || user == undefined) {
            return Response.json({
                code: 401,
                message: "User not found"
            }, {
                status: 401
            });
        }

        const myKeys = await userKeysCollection!.findOne({
            userID: userData.userID
        });
        if(myKeys == null || myKeys == undefined) {
            return Response.json({
                code: 401,
                message: "Key not found"
            }, {
                status: 401
            });
        }

        const {publicKey} = myKeys;
        const publicKeyDecryted = await decryptStringV2(publicKey, process.env.USER_PUBLIC_KEY) as string;

        const pKey = Forge.pki.publicKeyFromPem(publicKeyDecryted);

        const encryptedPassword = pKey.encrypt(`${process.env.SALT_KEY}_${data['password'] as string}`, 'RSA-OAEP', {
            md: Forge.md.sha256.create()
        });
        const encryptedB64 = String(Forge.util.encode64(encryptedPassword));

        await passwordsCollection!.findByIdAndUpdate(id, {
            title: data['title'],
            user:  data['user'],
            url: data['url'],
            itemType: data['itemType'],
            password: encryptedB64,
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