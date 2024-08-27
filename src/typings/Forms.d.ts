namespace Forms {
    interface IUserData {
        userID: string;
        fullname: string;
        email: string;
        password: string;
        picture?: string;
        userStatus: number;
        userCreatedType: "regular" | "facebook" | "google";
        userActivationToken?: string | null | undefined;
        userActivationTokenValidDate?: Date | null | undefined;
        userResetToken?: string | null | undefined;
        userResetTokenValidDate?: Date | null | undefined;
    }
    interface IPasswords {
        _id: Types.ObjectId | string;
        userID: string;
        title: string;
        user: string;
        url?: string | null | undefined;
        itemType?: string | null | undefined;
        password?: string | null | undefined;
        icon?: string;
        created_at: Date;
        updated_at: Date;
    }

    interface IPasswordExtends extends Forms.IPasswords {
        passwordVisible: boolean
    }

    interface IUserKeys {
        userID: Types.ObjectId | string;
        publicKey: string;
        privateKey: string;
    }
}