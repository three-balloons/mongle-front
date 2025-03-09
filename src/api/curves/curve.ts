import { mongleApi } from '@/api/mongleApi';
import { APIException } from '@/api/exceptions';
import {
    CreateCurveParams,
    CreateCurveReq,
    CreateCurveRes,
    CurveRes,
    DeleteCurveReq,
    DeleteCurveRes,
    RestoreCurveReq,
    UpdateCurveParams,
    UpdateCurveReq,
    UpdateCurveRes,
} from '@/api/curves/type';
import { curveDecoding, curveEncoding } from '@/api/curves/mapper';

export const createCurveAPI = async ({ curve, bubbleId, workspaceId }: CreateCurveParams): Promise<Curve> => {
    try {
        const res = await mongleApi.post<CreateCurveReq, CreateCurveRes, 'NO_PARENT' | 'ALREADY_EXEIST'>(
            '/curves',
            {
                position: curveEncoding(curve.position),
                bubbleId: bubbleId,
                config: curve.config,
            },
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return {
            type: 'curve',
            id: res.id,
            config: res.config,
            position: curveDecoding(res.position),
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

export const updateCurveAPI = async ({ curve, bubbleId, workspaceId }: UpdateCurveParams): Promise<Curve> => {
    try {
        const res = await mongleApi.put<UpdateCurveReq, UpdateCurveRes, 'NO_EXEIST_BUBBLE' | 'FAIL_EXEIT'>(
            `/curves/${curve.id}`,
            {
                position: curveEncoding(curve.position),
                bubbleId: bubbleId,
                config: curve.config,
            },
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return {
            type: 'curve',
            id: res.id,
            config: res.config,
            position: curveDecoding(res.position),
        };
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'NO_EXEIST_BUBBLE' || error.code === 'FAIL_EXEIT') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};

export const deleteCurveAPI = async ({ curveId, workspaceId }: DeleteCurveReq) => {
    try {
        const res = await mongleApi.delete<DeleteCurveRes, 'INAPPROPRIATE_DEPTH'>(`/curves/${curveId}`, {
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

export const restoreCurveAPI = async ({ curveId, workspaceId }: RestoreCurveReq): Promise<Curve> => {
    try {
        const res = await mongleApi.patch<RestoreCurveReq, CurveRes, 'USER_NOT_FOUND'>(
            `/curves/${curveId}/restore`,
            undefined,
            {
                headers: {
                    workspaceId: workspaceId,
                },
            },
        );
        return {
            type: 'curve',
            id: res.id,
            config: res.config,
            position: curveDecoding(res.position),
        };
    } catch (error: unknown) {
        if (error instanceof APIException) {
            if (error.code === 'USER_NOT_FOUND') {
                console.error('TODO error handling');
            }
        }
        throw error;
    }
};
