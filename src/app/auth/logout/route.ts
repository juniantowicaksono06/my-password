import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    const cookieStore = cookies();
    const response = NextResponse.redirect(new URL('/auth/login', process.env.APP_BASE_URL as string));
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    // let cookieList = cookieStore.getAll();
    // cookieList.forEach(cookie => {
    //     response.cookies.delete(cookie.name);
    // })
    return response;
}