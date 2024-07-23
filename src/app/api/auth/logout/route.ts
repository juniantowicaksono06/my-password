import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (req.method !== 'GET') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    cookies().set('accessToken', "", {
        httpOnly: true,
        secure: /^true$/i.test(process.env.USE_SECURE as string),
        path: '/',
        maxAge: -1
    });
    
    cookies().set('refreshToken', "", {
        httpOnly: true,
        secure: /^true$/i.test(process.env.USE_SECURE as string),
        path: '/',
        maxAge: -1
    });

    return Response.json({
        code: 200,
        message: "Logout"
    }, {
        status: 200
    });
}
