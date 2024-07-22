import Database from "@/src/database/database";

export async function GET(req: Request, res: Response) {
    try {
        // await ConnectDB();
        const dbMain = new Database('main');
        dbMain.initModel();
        const { appMenuCollection } = dbMain.getModels();
        const result = await appMenuCollection!.find();

        return Response.json({
            code: 200,
            data: result
        }, {
            status: 200
        });
    } catch (error) {
        return Response.json({
            code: 500,
            message: "Internal server error"
        }, {
            status: 500
        });
    }
}