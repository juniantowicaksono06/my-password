import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import NextCrypto from 'next-crypto'

// Middleware to detect if user is already logged in or not if not redirect to login page
const Authenticated = async (request: NextRequest, response: NextResponse) => {
    const verify = ["/auth/register", "/auth/login"]
    if(!verify.includes(request.nextUrl.pathname.toLowerCase())) {
        let cookieExist = false
        const cookieStore = cookies()
        const encryptAccessToken = cookieStore.get("accessToken")
        if(encryptAccessToken === undefined) {
            const response = NextResponse.redirect(new URL('/auth/login', request.url))
            let cookieList = cookieStore.getAll()
            cookieList.forEach(cookie => {
                response.cookies.delete(cookie.name)
            })
            return response
        }
        cookieExist = true
        let isCookieValid = false
        try {
            const accessCrypto = new NextCrypto(process.env.SECRET_KEY as string)
            const decrypt = await accessCrypto.decrypt(encryptAccessToken.value)
            if(decrypt === null) {
                throw new Error("Access Token is invalid")
            }
            isCookieValid = true
        }
        catch(error) {
            isCookieValid = false
        }
        if(!isCookieValid) {
            const response = NextResponse.redirect(new URL('/auth/login', request.url))
            let cookieList = cookieStore.getAll()
            cookieList.forEach(cookie => {
                response.cookies.delete(cookie.name)
            })
            return response
        }
    }
    return NextResponse.next()
}

export default Authenticated