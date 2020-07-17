export interface IUser {
    userName: string;
    displayName: string;
    token: string;
    refreshToken: string;
    image?: string;
}

export interface IUserFormValues {
    email: string;
    password: string;
    userName?: string;
    displayName?: string;
}
