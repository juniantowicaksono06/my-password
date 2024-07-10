import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(req: NextRequest, res: NextResponse) {
    const cookieStore = cookies();
    let url = req.headers.get('referer') || req.url;
    console.log(req.headers.get('referer'))
    console.log("The URL is", url)
    
    const response = NextResponse.redirect(new URL('/auth/login', url));
    let cookieList = cookieStore.getAll();
    cookieList.forEach(cookie => {
        response.cookies.delete(cookie.name);
    })
    return response;
}