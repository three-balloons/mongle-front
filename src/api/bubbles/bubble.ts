import { mongleApi } from '@/api/mongleApi';
import { APIException } from '@/api/exceptions';
import {
    CreateBubblePrams,
    CreateBubbleReq,
    CreateBubbleRes,
    DeleteBubbleReq,
    DeleteBubbleRes,
    GetAllBubbleReq,
    GetAllBubbleRes,
    GetBubbleReq,
    RestoreBubbleParams,
    RestoreBubbleReq,
    RestoreBubbleRes,
    UpdateBubblePrams,
    UpdateBubbleReq,
    UpdateBubbleRes,
} from '@/api/bubbles/type';
import { shapeMapper } from '@/api/bubbles/mapper';
import { NAME_SIZE_IN_CANVAS } from '@/util/constant';

export const getAllBubblesAPI = async ({ workspaceId, depth }: GetAllBubbleReq): Promise<Bubble[]> => {
    try {
        const res = await mongleApi.get<GetAllBubbleRes, 'INAPPROPRIATE_DEPTH'>(
            `/bubbles${depth ? '/?depth=' + depth.toString() : ''}`,
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return res.map((bubble) => {
            return {
                ...bubble,
                shapes: [...bubble.shapes.map((shpae) => shapeMapper(shpae))],
                nameSizeInCanvas: NAME_SIZE_IN_CANVAS,
            } as Bubble;
        });
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'INAPPROPRIATE_DEPTH') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const getBubblesAPI = async ({ workspaceId, bubbleId, depth }: GetBubbleReq): Promise<Bubble[]> => {
    try {
        const res = await mongleApi.get<GetAllBubbleRes, 'INAPPROPRIATE_DEPTH'>(
            `/bubbles/${bubbleId}${depth ? '?depth=' + depth.toString() : ''}`,
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return res.map((bubble) => {
            return {
                ...bubble,
                shapes: [...bubble.shapes.map((shpae) => shapeMapper(shpae))],
                nameSizeInCanvas: NAME_SIZE_IN_CANVAS,
            } as Bubble;
        });
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'INAPPROPRIATE_DEPTH') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const deleteBubbleAPI = async ({ workspaceId, bubbleId }: DeleteBubbleReq) => {
    try {
        const res = await mongleApi.delete<DeleteBubbleRes, 'INAPPROPRIATE_DEPTH'>(`/bubbles/${bubbleId}`, {
            headers: {
                workspaceId: workspaceId,
            },
        });
        return res;
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'INAPPROPRIATE_DEPTH') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const createBubbleAPI = async ({
    workspaceId,
    path,
    name,
    top,
    left,
    height,
    width,
}: CreateBubbleReq): Promise<Bubble> => {
    try {
        const res = await mongleApi.post<CreateBubblePrams, CreateBubbleRes, 'NO_PARENT' | 'ALREADY_EXEIST'>(
            '/bubbles',
            {
                top: top,
                left: left,
                height: height,
                width: width,
                name: name,
                path: path,
            },
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return {
            ...res,
            shapes: [...res.shapes.map((shpae) => shapeMapper(shpae))],
            nameSizeInCanvas: NAME_SIZE_IN_CANVAS,
        };
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'NO_PARENT' || error.code === 'ALREADY_EXEIST') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const updateBubbleAPI = async ({
    workspaceId,
    bubbleId,
    newPath,
    name,
    top,
    left,
    height,
    width,
}: UpdateBubblePrams) => {
    try {
        const res = await mongleApi.put<UpdateBubbleReq, UpdateBubbleRes, 'NO_PARENT' | 'ALREADY_EXEIST'>(
            `/bubbles/${bubbleId}`,
            {
                newPath: newPath,
                top: top,
                left: left,
                height: height,
                width: width,
                name: name,
            },
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

export const restoreBubbleAPI = async ({ workspaceId, bubbleId }: RestoreBubbleParams) => {
    try {
        const res = await mongleApi.patch<RestoreBubbleReq, RestoreBubbleRes, 'NO_PARENT' | 'ALREADY_EXEIST'>(
            `/bubbles/${bubbleId}/restore`,
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
