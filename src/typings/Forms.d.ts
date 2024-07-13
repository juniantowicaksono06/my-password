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
        userID: string;
        title: string;
        url?: string | null | undefined;
        itemType?: string | null | undefined;
        password: string;
    }
}