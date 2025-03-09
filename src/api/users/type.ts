/** getWorkspaceAPI */
export type GetUserRes = User;

/** updateUserAPI */
export type UpdateUserReq = {
    name: string;
    email?: string;
};
export type UpdateUserRes = User;

/** deleteUserAPI */
export type DeleteUserRes = {
    id: number;
};

/** restoreUserAPI */
export type RestoreUserReq = {
    userId: number;
};
export type RestoreUserRes = User;
