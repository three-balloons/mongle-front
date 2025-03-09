import { APIException } from '@/api/exceptions';
import { mongleApi } from '@/api/mongleApi';
import { pictureMapper } from '@/api/pictrues/mapper';
import {
    CreatePicturePrams,
    CreatePictureReq,
    CreatePictureRes,
    DeletePictureReq,
    DeletePictureRes,
    GetPictureReq,
    GetPictureRes,
    RestorePicturePrams,
    RestorePictureReq,
    RestorePictureRes,
} from '@/api/pictrues/type';

export const getPictureAPI = async ({ workspaceId, pictureId }: GetPictureReq): Promise<Picture> => {
    try {
        const res = await mongleApi.get<GetPictureRes, 'WORKSPACE_NOT_FOUND'>(`/pictures/${pictureId}`, {
            headers: {
                workspaceId: workspaceId,
            },
        });
        return pictureMapper(res);
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'WORKSPACE_NOT_FOUND') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const deletePictureAPI = async ({ workspaceId, pictureId }: DeletePictureReq) => {
    try {
        const res = await mongleApi.delete<DeletePictureRes, 'WORKSPACE_NOT_FOUND'>(`/pictures/${pictureId}`, {
            headers: {
                workspaceId: workspaceId,
            },
        });
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'WORKSPACE_NOT_FOUND') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const createPictureAPI = async ({
    workspaceId,
    left,
    top,
    width,
    height,
    isFlippedX,
    isFlippedY,
    angle,
    path,
    fid,
}: CreatePicturePrams): Promise<Picture> => {
    try {
        const res = await mongleApi.post<CreatePictureReq, CreatePictureRes, 'NO_PARENT' | 'ALREADY_EXEIST'>(
            '/pictures',
            {
                left,
                top,
                width,
                height,
                isFlippedX,
                isFlippedY,
                angle,
                path,
                fid,
            },
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return pictureMapper(res);
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'NO_PARENT' || error.code === 'ALREADY_EXEIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const restorePictureAPI = async ({ workspaceId, pictureId }: RestorePicturePrams) => {
    try {
        const res = await mongleApi.patch<RestorePictureReq, RestorePictureRes, 'NO_PARENT' | 'ALREADY_EXEIST'>(
            `/pictures/${pictureId}/restore`,
            undefined,
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'NO_PARENT' || error.code === 'ALREADY_EXEIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};
