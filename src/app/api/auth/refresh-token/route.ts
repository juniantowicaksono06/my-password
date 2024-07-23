
// import { ConnectDB, userTokenCollection, userCollection } from "@/src/database";
import TokenHandler from "@/src/shared/TokenHandler";
import Joi from "@hapi/joi";
import { SignJWT } from "jose";
import Database from '@/src/database/database';


export async function POST(req: Request, res: Response) {

    const schema = Joi.object({
        refreshToken: Joi.string().required().label("Refresh Token")
    })
    try {
        var data: {
            refreshToken: string
        } = await req.json();

        const {error, value} = schema.validate(data)
        if (error) {
            return Response.json({
                code: 400,
                message: error.details.map(i => i.message).join(',')
            }, {
                status: 400
            });
        }
    } catch (error) {
        return Response.json({
            code: 400,
            message: "No input provided"
        }, {
            status: 400
        });
    }
    try {
        const dbMain = new Database('main');
        dbMain.initModel();
        const {userTokenCollection, userCollection } = dbMain.getModels();
        const refreshTokenDB = await userTokenCollection!.findOne({
            token: data['refreshToken']
        });
        if(refreshTokenDB) {
            var tokenHandler = new TokenHandler();
            tokenHandler.init(null, data['refreshToken']);
            if(!(await tokenHandler.validateRefresh(false))) {
                throw new Error("Refresh token is invalid");
            }
            const refreshPayload= tokenHandler.getRefreshPayload() as Forms.IUserData;
            const userID = refreshPayload['userID'];
            const user = await userCollection!.findOne({
                _id: userID
            });
            if(user == null) {
                return Response.json({
                    code: 404,
                    message: "User is not found!"
                }, {
                    status: 200
                });
            }
            if(user['userStatus'] != 1) {
                return Response.json({
                    code: 403,
                    message: "User is not active"
                }, {
                    status: 200
                });
            }
            const accessSecretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY as string);
            const accessToken = await new SignJWT({
                userID: userID,
                fullname: user['fullname'],
                email: user['email'],
                userStatus: user['userStatus'],
                picture: user['picture'] == undefined ? "" : user['picture']
            }).setProtectedHeader({
                alg: 'HS256',
                typ: 'JWT'
            })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(accessSecretKey);
            return Response.json({
                code: 200,
                data: {
                    accessToken: accessToken
                },
                message: "Refresh token is valid"
            }, {
                status: 200
            });
        }
        else {
            return Response.json({
                code: 404,
                message: "Refresh token is invalid"
            }, {
                status: 200
            });
        }
    }
    catch (error) {
        let message = ""
        if(error instanceof Error) {
            message = error.message
        }
        else {
            message = "Unknown server error"
        }
        return Response.json({
            code: 500,
            message: message
        }, {
            status: 500
        })
    }
}