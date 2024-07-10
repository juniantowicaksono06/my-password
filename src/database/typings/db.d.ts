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
}