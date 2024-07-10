/**
 * Handles the GET request and returns a JSON response with a code of 200 and a message of "It works!".
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @return {Promise<void>} A Promise that resolves when the response is sent.
 */
export async function GET(req: Request, res: Response) {
    return Response.json({
        code: 200,
        message: "It works!"
    }, {
        status: 200
    })
}