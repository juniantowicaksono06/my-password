"use server"
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import TokenHandler from "./shared/TokenHandler";
import { encryptStringV2 } from "./shared/function";

/**
 * Logs out the user by deleting cookies and redirecting to the login page.
 *
 * @param {NextRequest} req - The Next.js request object.
 * @param {NextResponse} res - The Next.js response object.
 * @return {NextResponse} The response object after deleting cookies and redirecting.
 */
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
    let currentPath = request.nextUrl.pathname.toLowerCase();
    const headers = new Headers(request.headers);
    headers.set("x-current-href", request.nextUrl.href);
    headers.set("x-current-path", request.nextUrl.pathname);
    if(currentPath.startsWith('/api')) {
        const notRequiredAuth = ["/api/auth/login", "/api/auth/refresh-token", "/api/auth/register", "/api/google-oauth2/auth", "/api/profile-picture-upload", "/api/test"];
        const verify = new TokenHandler();
        let isNotApiAuthPath = false;
        verify.init();
        notRequiredAuth.some(path => {
            if(currentPath == path) {
                isNotApiAuthPath = true;
                return;
            }
            if(path.endsWith('/:slug')) { 
                let slugPath = path.split('/:slug').slice(0, path.split('/:slug').length - 1).join('/');
                if(currentPath.startsWith(slugPath)) {
                    isNotApiAuthPath = true;
                    return;
                }
            }
        });
        const validated = await verify.validate();
        headers.set('x-user-data', JSON.stringify(verify.getAccessPayload()));
        const apiResponse = NextResponse.next({
            request: {
                headers
            }
        });
        if(!isNotApiAuthPath && validated === false) {
            return Response.json({
                code: 403,
                message: "Forbidden Access!"
            }, {
                status: 403
            })
        }
        return apiResponse;
    }
    else {
        const webResponse = NextResponse.next({
            headers
        });
        const webNotLoginPath = ["/auth/register", "/auth/login", "/auth/activate/:slug", "/auth/integrations/google/oauth2/callback"];
        const verify = new TokenHandler();
        let isNotWebLoginPath = false;
        webNotLoginPath.some(path => {
            if(currentPath == path) {
                isNotWebLoginPath = true;
                return;
            }
            if(path.endsWith('/:slug')) { 
                let slugPath = path.split('/:slug').slice(0, path.split('/:slug').length - 1).join('/');
                if(currentPath.startsWith(slugPath)) {
                    isNotWebLoginPath = true;
                    return;
                }
            }
        });
        verify.init();
        const validated = await verify.validate();
        console.log("isNotWebLoginPath:", isNotWebLoginPath);
        console.log("validated:", validated);
        if(!isNotWebLoginPath && validated !== false) {
            const response = await fetch(`${process.env.APP_BASE_URL as string}/api/auth/refresh-token`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken: verify.getRefreshToken()
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
                    const accessToken = await encryptStringV2(result['data']!['accessToken']);
                    webResponse.cookies.set('accessToken', accessToken);
                }
            }
            else {
                return forceLogout(request, webResponse);
            }
        }
        else if(validated !== false) {
            return webResponse;
        }
        else if(isNotWebLoginPath) {
            if(validated !== false) {
                const response = NextResponse.redirect(new URL('/', request.url));
                return response;
            }
        }
        else {
            return forceLogout(request, webResponse);
        }
    }
}
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons).*)'
    ]
};