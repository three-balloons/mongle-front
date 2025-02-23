import { mongleApi } from '@/api/mongleApi';
import { APIException } from '@/api/exceptions';
import { GetAccessTokenReq, GetAccessTokenRes, TestLoginRes } from '@/api/auth/type';

export const getAccessTokenAPI = async ({ provider, code, redirectUri }: GetAccessTokenReq) => {
    try {
        const res = await mongleApi.post<
            GetAccessTokenReq,
            GetAccessTokenRes,
            'INAPPROPRIATE_PAYLOAD' | 'SIGN_UP_NEEDED' | 'NOT_MATCH_PASSWORD'
        >('/auth/access', {
            provider: provider,
            code: code,
            redirectUri: redirectUri,
        });
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (
                error.code === 'INAPPROPRIATE_PAYLOAD' ||
                error.code === 'SIGN_UP_NEEDED' ||
                error.code === 'NOT_MATCH_PASSWORD'
            ) {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const testLoginAPI = async () => {
    try {
        const res = await mongleApi.get<
            TestLoginRes,
            'INAPPROPRIATE_PAYLOAD' | 'SIGN_UP_NEEDED' | 'NOT_MATCH_PASSWORD'
        >('/auth/test');
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (
                error.code === 'INAPPROPRIATE_PAYLOAD' ||
                error.code === 'SIGN_UP_NEEDED' ||
                error.code === 'NOT_MATCH_PASSWORD'
            ) {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};
