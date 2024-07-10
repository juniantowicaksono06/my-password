import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import NextCrypto from 'next-crypto'

// Middleware to detect if user is logged in or not if yes redirect to home page
const Unauthenticated = async (request: NextRequest, response: NextResponse) => {
    const verify = ["/auth/register", "/auth/login"]
    if(verify.includes(request.nextUrl.pathname.toLowerCase())) {
        let cookieExist = false
        const cookieStore = cookies()
        const encryptAccessToken = cookieStore.get("accessToken")
        cookieExist = true
        let isCookieValid = false
        try {
            const accessCrypto = new NextCrypto(process.env.SECRET_KEY as string)
            const decrypt = await accessCrypto.decrypt(encryptAccessToken!.value)
            if(decrypt === null) {
                throw new Error("Access Token is invalid")
            }
            isCookieValid = true
        }
        catch(error) {
            isCookieValid = false
        }
        if(isCookieValid) {
            const response = NextResponse.redirect(new URL('/', request.url))
            return response
        }
    }
}

export default Unauthenticated