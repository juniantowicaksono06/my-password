import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    // const cookieStore = cookies();
    const response = NextResponse.redirect(new URL('/auth/login', process.env.APP_BASE_URL as string));
    response.cookies.set('accessToken', '', { maxAge: 0 });
    response.cookies.set('refreshToken', '', { maxAge: 0 });
    // let cookieList = cookieStore.getAll();
    // cookieList.forEach(cookie => {
    //     response.cookies.delete(cookie.name);
    // })
    return response;
}