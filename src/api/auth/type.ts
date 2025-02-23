export type GetAccessTokenReq = {
    provider: Provider;
    code: string;
    redirectUri: string;
};
export type GetAccessTokenRes = {
    accessToken: string;
};

export type TestLoginRes = {
    accessToken: string;
};
