export async function GET(req: Request, res: Response) {
    try {
        const url = new URL(req.url);
        const u = new URLSearchParams(url.search);
        const response = await fetch(u.get('url') as string);
        if(response.ok) {
            const result = await response.arrayBuffer();
            return new Response(result, {
                headers: {
                    'Content-Type': 'image/png',
                },
            });
        }
        else {
            return new Response(null, {
                status: 404
            });
        }
    }
    catch(error) {
        console.error(error);
        return new Response(null, {
            status: 500
        });
    }
}