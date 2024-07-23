import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    if (req.method !== 'GET') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const response = NextResponse.redirect(new URL('/auth/login', process.env.APP_BASE_URL as string));
    console.log("LOGOUT FROM LOGOUT BUTTON");
    
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

    return response;
}
