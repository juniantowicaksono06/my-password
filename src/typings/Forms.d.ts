namespace Forms {
    interface IUserData {
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
}