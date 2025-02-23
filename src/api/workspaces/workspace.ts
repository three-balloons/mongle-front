import { mongleApi } from '@/api/mongleApi';
import { APIException } from '@/api/exceptions';
import {
    CreateWorkspaceReq,
    CreateWorkspaceRes,
    DeleteWorkspaceReq,
    DeleteWorkspaceRes,
    GetAllWorkspaceRes,
    GetDeletedWorkspaceRes,
    GetWorkspaceParams,
    GetWorkspaceRes,
    RestoreWorkspaceParams,
    RestoreWorkspaceReq,
    RestoreWorkspaceRes,
    UpdateWorkspacePrams,
    UpdateWorkspaceReq,
    UpdateWorkspaceRes,
} from '@/api/workspaces/type';

export const getWorkspaceAPI = async ({ workspaceId }: GetWorkspaceParams) => {
    try {
        const res = await mongleApi.get<GetWorkspaceRes, 'NOT_EXIST'>(`/workspaces/${workspaceId}`);
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'NOT_EXIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const getAllWorkspaceAPI = async () => {
    try {
        const res = await mongleApi.get<GetAllWorkspaceRes, 'NOT_EXIST'>('/workspaces');
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            // TODO remove this error code
            if (error.code === 'NOT_EXIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const updateWorkspaceAPI = async ({ workspaceId, name, theme }: UpdateWorkspacePrams) => {
    try {
        const res = await mongleApi.put<UpdateWorkspaceReq, UpdateWorkspaceRes, 'ALREADY_EXIST'>(
            `/workspace/${workspaceId}`,
            {
                name: name,
                theme: theme,
            },
        );
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'ALREADY_EXIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const deleteWorkspaceAPI = async ({ workspaceId }: DeleteWorkspaceReq) => {
    try {
        const res = await mongleApi.delete<DeleteWorkspaceRes, 'NOT_EXIST'>(`/workspaces/${workspaceId}`);
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'NOT_EXIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const createWorkspaceAPI = async ({ name, theme }: CreateWorkspaceReq) => {
    try {
        const res = await mongleApi.post<CreateWorkspaceReq, CreateWorkspaceRes, 'ALREADY_EXIST'>(`/workspace`, {
            name: name,
            theme: theme,
        });
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'ALREADY_EXEIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const getDeletedWorkspaceAPI = async () => {
    try {
        const res = await mongleApi.get<GetDeletedWorkspaceRes, 'NOT_EXIST'>('/workspaces/deleted');
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            // TODO remove this error code
            if (error.code === 'NOT_EXIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const restoreWorkspaceAPI = async ({ workspaceId }: RestoreWorkspaceParams) => {
    try {
        const res = await mongleApi.patch<RestoreWorkspaceReq, RestoreWorkspaceRes, 'ALREADY_EXIST'>(
            `/workspaces/${workspaceId}/restore`,
        );
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'ALREADY_EXIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};
