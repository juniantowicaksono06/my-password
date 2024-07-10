"use server"
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import NextCrypto from 'next-crypto';

const forceLogout = (req: NextRequest, res: NextResponse) => {
    const cookieStore = cookies()
    const response = NextResponse.redirect(new URL('/auth/login', req.url))
    let cookieList = cookieStore.getAll()
    cookieList.forEach(cookie => {
        response.cookies.delete(cookie.name)
    })
    return response
}

export const middleware = async (request: NextRequest, response: NextResponse) => {
    const notLoginPath = ["/auth/register", "/auth/login", "/auth/activate/:slug", "/auth/integrations/google/oauth2/callback"];
    let cookieExist = false;
    const cookieStore = cookies();
    const encryptRefreshToken = cookieStore.get("refreshToken");

    const headers = new Headers(request.headers);
    headers.set("x-current-href", request.nextUrl.href);
    headers.set("x-current-path", request.nextUrl.pathname);
    const webResponse = NextResponse.next({
        headers
    });

    let currentPath = request.nextUrl.pathname.toLowerCase();
    let isInNotLoginPath = false;
    notLoginPath.some(path => {
        if(currentPath == path) {
            isInNotLoginPath = true;
            return;
        }
        if(path.endsWith('/:slug')) { 
            let slugPath = path.split('/:slug').slice(0, path.split('/:slug').length - 1).join('/');
            if(currentPath.startsWith(slugPath)) {
                isInNotLoginPath = true;
                return;
            }
        }
    });
    
    // currentUrl = currentUrl.split('/:slug').slice(0, currentUrl.split('/:slug').length - 1).join('/');

    if(!isInNotLoginPath) {
        if(encryptRefreshToken === undefined) {
            return forceLogout(request, response);
        }
        cookieExist = true;
        let isCookieValid = false;
        try {
            const accessTCrypto = new NextCrypto(process.env.SECRET_KEY as string);
            const refreshTCrypto = new NextCrypto(process.env.REFRESH_KEY as string);
            const refreshToken = await refreshTCrypto.decrypt(encryptRefreshToken.value);
            if(refreshToken === null) {
                throw new Error("Refresh Token is invalid");
            }
            const response = await fetch(`${process.env.APP_BASE_URL as string}/api/auth/refresh-token`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: refreshToken
                })
            })
            if(response.ok) {
                const result = await response.json() as {
                    code: number,
                    data?: {
                        accessToken: string
                    },
                    message: string
                }
                if(result['code'] == 200) {
                    const accessToken = await accessTCrypto.encrypt(result['data']!['accessToken'])
                    webResponse.cookies.set('accessToken', accessToken)
                }
            }
            isCookieValid = true;
        }
        catch(error) {
            isCookieValid = false;
        }
        if(!isCookieValid) {
            return forceLogout(request, response);
        }
        return webResponse;
    }
    else {
        cookieExist = true
        let isCookieValid = false
        try {
            const accessCrypto = new NextCrypto(process.env.SECRET_KEY as string);
            const encryptAccessToken = cookieStore.get("accessToken");
            const decrypt = await accessCrypto.decrypt(encryptAccessToken!.value);
            if(decrypt === null) {
                throw new Error("Access Token is invalid");
            }
            isCookieValid = true;
        }
        catch(error) {
            isCookieValid = false;
        }
        if(isCookieValid) {
            const response = NextResponse.redirect(new URL('/', request.url));
            return response;
        }
    }
}
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
};