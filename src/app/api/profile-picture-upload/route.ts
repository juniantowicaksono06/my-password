import FileUpload from "@/src/shared/FileUpload";
export async function POST(req: Request, res: Response) {
    try {
        const formData = req.formData()
        const file = (await formData).get('image') as File
        const fileUpload = new FileUpload();
        fileUpload.setAllowedMimes(['image/jpeg', 'image/png', 'image/jpg']).setFile(file).setIsFileImage(true).setAllowImageCompress(true);
        const result = await fileUpload.validate(file);
        if(!result["success"]) {
            return Response.json({
                "code": 400,
                "message": result["message"]
            })
        }
        else if(result['error']) {
            return Response.json({
                "code": 500,
                "message": result["message"]
            });
        }
        return Response.json({
            "code": 200,
            "data": {
                "filePath": result['filePath']
            },
            "message": "Succesfully uploaded file"
        })
    }
    catch(error) {
        return Response.json({
            "code": 500,
            "message": "Failed to upload image"
        })
    }
}
