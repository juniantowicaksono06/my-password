import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    const cookieStore = cookies();
    cookies().delete('accessToken');
    cookies().delete('refreshToken');
    cookies().set({
        name: 'accessToken',
        value: '',
        expires: new Date('2016-10-05'),
        path: '/'
    });
    cookies().set({
        name: 'refreshToken',
        value: '',
        expires: new Date('2016-10-05'),
        path: '/'
    });
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