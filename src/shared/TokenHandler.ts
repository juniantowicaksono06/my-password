import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { decryptStringV2 } from "./function";
class TokenHandler {
    private encryptedOTPToken: string | undefined;
    private encryptedAccessToken: string | undefined;
    private encryptedRefreshToken: string | undefined;
    private accessRawJWT: string | undefined;
    private refreshRawJWT: string | undefined;
    private jwtOTPPayload: {
        userID: string
    } | undefined;
    private jwtAccessPayload: Forms.IUserData | undefined;
    private jwtRefreshPayload: Forms.IUserData | undefined;
    private decryptedOTPToken: string | undefined;
    private decryptedAccessToken: string | undefined;
    private decryptedRefreshToken: string | undefined;

    init(accessToken: string | null = null, refreshToken: string | null = null, otptoken: string | null = null) {
        const cookieStore = cookies();
        if(accessToken === null) {
            this.encryptedAccessToken = cookieStore.get("accessToken")?.value;
        }
        else {
            this.accessRawJWT = accessToken as string;
        }
        if(refreshToken === null) {
            this.encryptedRefreshToken = cookieStore.get("refreshToken")?.value;
        }
        else {
            this.refreshRawJWT = refreshToken as string;
        }
        if(otptoken === null) {
            this.encryptedOTPToken = cookieStore.get("otpAccess")?.value;
        }
        else {
            this.encryptedOTPToken = otptoken as string;
        }
        return this;
    }

    async validateAccess(encrypted = true) {
        try {
            var token;
            if(encrypted) {
                if(this.encryptedAccessToken === undefined) {
                    return false;
                }
                const decryptedAccessToken = await decryptStringV2(this.encryptedAccessToken, process.env.ACCESS_KEY as string);
                if(decryptedAccessToken === null) {
                    throw new Error("Access Token is invalid");
                }
                token = decryptedAccessToken;
            }
            else {
                token = this.accessRawJWT;
            }
            const accessSecretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY as string);
            const accessPayload = await jwtVerify(token as string, accessSecretKey);
            this.decryptedAccessToken = token;
            this.jwtAccessPayload = accessPayload['payload'] as unknown as Forms.IUserData;
            return true;
        } catch (error) {
            return false;
        }
    }

    async validateRefresh(encrypted = true) {
        try {
            var token;
            if(encrypted) {
                if(this.encryptedRefreshToken === undefined) {
                    return false;
                }
                const decryptedRefreshToken = await decryptStringV2(this.encryptedRefreshToken, process.env.REFRESH_KEY as string);
                if(decryptedRefreshToken === null) {
                    throw new Error("Refresh Token is invalid");
                }
                token = decryptedRefreshToken;
            }
            else {
                token = this.refreshRawJWT;
            }
            const refreshSecretKey = new TextEncoder().encode(process.env.JWT_REFRESH_KEY as string);
            const refreshPayload = await jwtVerify(token as string, refreshSecretKey);
            this.decryptedRefreshToken = token;
            this.jwtRefreshPayload = refreshPayload['payload'] as unknown as Forms.IUserData;
            return true;
        } catch (error) {
            return false;
        }
    }

    async validateOTP(encrypted = true) {
        try {
            var token;
            if(encrypted) {
                if(this.encryptedOTPToken === undefined) {
                    return false;
                }
                const decryptedOTPToken = await decryptStringV2(this.encryptedOTPToken, process.env.OTP_KEY as string);
                if(decryptedOTPToken === null) {
                    throw new Error("OTP Token is invalid");
                }
                token = decryptedOTPToken;
            }
            else {
                token = this.encryptedOTPToken;
            }
            const otpSecretKey = new TextEncoder().encode(process.env.JWT_OTP as string);
            const otpPayload = await jwtVerify(token as string, otpSecretKey);
            this.decryptedOTPToken = token;
            this.jwtOTPPayload = otpPayload['payload'] as unknown as {
                userID: string
            };
            return true;
        } catch (error) {
            return false;
        }
    }

    async validate() {
        if(await this.validateAccess() && await this.validateRefresh()) {
            return true;
        }
        return false;
    }

    getAccessPayload() {
        return this.jwtAccessPayload;
    }

    getRefreshPayload() {
        return this.jwtRefreshPayload;
    }

    getAccessToken() {
        return this.decryptedAccessToken;
    }

    getRefreshToken() {
        return this.decryptedRefreshToken;
    }
    getOTPToken() {
        return this.decryptedOTPToken;
    }
    getOTPPayload() {
        return this.jwtOTPPayload;
    }
}

export default TokenHandler;