import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    const cookieStore = cookies();
    const response = NextResponse.redirect(new URL('/auth/login', process.env.APP_BASE_URL as string));
    console.log("LOGOUT FROM LOGOUT BUTTON")
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
    // cookieStore.delete('accessToken');
    // cookieStore.delete('refreshToken');
    // let cookieList = cookieStore.getAll();
    // cookieList.forEach(cookie => {
    //     response.cookies.delete(cookie.name);
    // })
    return response;
}