import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    const cookieStore = cookies();
    cookies().delete('accessToken');
    cookies().delete('refreshToken');
    cookies().set('accessToken', '',{
        expires: new Date('2016-10-05'),
        path: '/',
        secure: /^true$/i.test(process.env.USE_SECURE as string),
        partitioned: /^true$/i.test(process.env.USE_SECURE as string),
    });
    cookies().set('refreshToken', '',{
        expires: new Date('2016-10-05'),
        path: '/',
        secure: /^true$/i.test(process.env.USE_SECURE as string),
        partitioned: /^true$/i.test(process.env.USE_SECURE as string),
    });
    console.log("LOGOUT")
    cookieStore.getAll().forEach(cookie => {
        cookieStore.delete(cookie.name);
    })
    const response = NextResponse.redirect(new URL('/auth/login', process.env.APP_BASE_URL as string));
    let cookieList = cookieStore.getAll();
    cookieList.forEach(cookie => {
        response.cookies.delete(cookie.name);
    })
    return response;
}