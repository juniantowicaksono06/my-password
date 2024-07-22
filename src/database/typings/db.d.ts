namespace Database {
    import {Types} from 'mongoose';
    interface IUserData {
        fullname: string;
        email: string;
        password?: string | null | undefined;
        picture?: string | null | undefined;
        userStatus: number;
        userCreatedType: string;
        userActivationToken?: string | null | undefined;
        userActivationTokenValidDate?: Date | null | undefined;
        userResetTokenValidDate?: Date | null | undefined;
        userResetToken?: string | null | undefined;
    }   

    interface IUserToken {
        userID: Types.ObjectId;
        token: string;
        validDate: Date;
    }

    interface IAppMenu {
        name: string;
        icon: string;
        link: string;
        active: boolean;
    }
    interface IPasswords {
        userID: Types.ObjectId;
        title: string;
        user: string;
        url?: string | null | undefined;
        itemType?: string | null | undefined;
        password?: string | null | undefined;
        created_at: Date;
        updated_at: Date;
    }
    interface ILoginOTP {
        userID: Types.ObjectId;
        otp: string;
        validUntil: Date;
        isActive: boolean;
    }
    interface IUserKeys {
        userID: Types.ObjectId;
        publicKey: string;
        privateKey: string;
    }
}