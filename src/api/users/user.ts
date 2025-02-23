import { mongleApi } from '@/api/mongleApi';
import { APIException } from '@/api/exceptions';
import {
    DeleteUserRes,
    GetUserRes,
    RestoreUserReq,
    RestoreUserRes,
    UpdateUserReq,
    UpdateUserRes,
} from '@/api/users/type';

export const getUserAPI = async () => {
    try {
        const res = await mongleApi.get<GetUserRes, 'USER_NOT_FOUND'>('/users');
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'USER_NOT_FOUND') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const updateUserAPI = async ({ name, email }: UpdateUserReq) => {
    try {
        const res = await mongleApi.put<UpdateUserReq, UpdateUserRes, 'USER_NOT_FOUND'>('/users', {
            name: name,
            email: email,
        });
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'USER_NOT_FOUND') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const deleteUserAPI = async () => {
    try {
        const res = await mongleApi.delete<DeleteUserRes, 'USER_NOT_FOUND'>('/users');
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'USER_NOT_FOUND') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const restoreUserAPI = async ({ userId }: RestoreUserReq) => {
    try {
        const res = await mongleApi.patch<RestoreUserReq, RestoreUserRes, 'USER_NOT_FOUND'>(`/users/${userId}/restore`);
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'USER_NOT_FOUND') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};
