import { useEffect, useRef } from 'react';
// import { createBubbleAPI } from '@/api/bubble';
import { useMutation } from '@tanstack/react-query';
import { createBubbleAPI, deleteBubbleAPI } from '@/api/bubbles/bubble';
import { useLogStore } from '@/store/useLogStore';
import { isLogBubble, isLogCurve } from '@/util/typeGuard';
import { updateCurveAPI } from '@/api/curves/curve';

interface CurveMutationProps {
    workspaceId: string;
    bubbleId: number;
    curve: Curve;
}

interface BubbleMutationProps {
    workspaceId: string;
    bubble: Bubble;
}

/**
 *
 * 서버에 데이터 전송 담당
 */
export const useLogSender = () => {
    const { setCheckpoint, clearAllLog } = useLogStore();
    const workspaceIdRef = useRef(useLogStore.getState().currentWorkspaceId);

    useEffect(() => {
        const unsubscribeLogStore = useLogStore.subscribe(({ currentWorkspaceId }) => {
            workspaceIdRef.current = currentWorkspaceId;
        });

        return () => {
            unsubscribeLogStore();
        };
    }, []);

    /* Bubbles */
    const { mutateAsync: createBubbleMutation } = useMutation({
        mutationFn: ({ workspaceId, bubble }: BubbleMutationProps) =>
            createBubbleAPI({
                workspaceId,
                path: bubble.path,
                name: bubble.name,
                top: bubble.top,
                left: bubble.left,
                height: bubble.height,
                width: bubble.width,
            }),
    });

    const { mutateAsync: deleteBubbleMutation } = useMutation({
        mutationFn: ({ workspaceId, bubble }: BubbleMutationProps) => {
            if (bubble.id) {
                return deleteBubbleAPI({ workspaceId, bubbleId: bubble.id });
            } else {
                throw new Error('Bubble ID is required');
            }
        },
    });

    // const { mutate: updateBubbleMutation } = useMutation({
    //     mutationFn: ({ workspaceId, bubble }: BubbleMutationProps) => updateBubbleAPI({ workspaceId, bubble }),
    // });

    /* Curves */
    const { mutate: createCurveMutation } = useMutation({
        mutationFn: ({ workspaceId, bubbleId, curve }: CurveMutationProps) =>
            updateCurveAPI({ workspaceId, bubbleId, curve }),
    });

    const { mutate: updateCurveMutation } = useMutation({
        mutationFn: ({ workspaceId, bubbleId, curve }: CurveMutationProps) =>
            updateCurveAPI({ workspaceId, bubbleId, curve }),
    });

    const { mutate: deleteCurveMutation } = useMutation({
        mutationFn: ({ workspaceId, bubbleId, curve }: CurveMutationProps) =>
            updateCurveAPI({
                workspaceId,
                bubbleId,
                curve,
            }),
    });

    const sendLogsToServer = (isClearLog: boolean = false) => {
        const workspaceId = workspaceIdRef.current;
        if (!workspaceId || workspaceId == 'demo') return;
        const checkpoint = useLogStore.getState().logs[workspaceId].checkpoint;
        const logs: Array<LogGroup> = useLogStore.getState().logs[workspaceId].redoStack;
        let currentPoint = checkpoint;
        while (currentPoint < logs.length) {
            logs[currentPoint].forEach((log) => commitToServer(log));
            currentPoint++;
        }
        if (isClearLog) clearAllLog();
        else setCheckpoint(currentPoint);

        console.log('전송 완료!');
    };

    const commitToServer = async (log: LogElement) => {
        const workspaceId = workspaceIdRef.current;
        if (!workspaceId || workspaceId == 'demo') return;
        switch (log.type) {
            case 'create':
                if (isLogBubble(log)) {
                    // update bubble id
                    log.modified.object = await createBubbleMutation({
                        workspaceId: workspaceId,
                        bubble: log.modified.object,
                    });
                } else if (isLogCurve(log)) {
                    createCurveMutation({
                        workspaceId: workspaceId,
                        bubbleId: log.modified.bubbleId,
                        curve: log.modified.object,
                    });
                }
                break;
            case 'delete':
                if (isLogBubble(log)) {
                    deleteBubbleMutation({ workspaceId: workspaceId, bubble: log.modified.object });
                } else if (isLogCurve(log)) {
                    deleteCurveMutation({
                        workspaceId: workspaceId,
                        bubbleId: log.modified.bubbleId,
                        curve: log.modified.object,
                    });
                }
                break;
            case 'update': // path 변경 없는 경우, 크기 등만 변함
                if (isLogBubble(log)) {
                    // // 제거 후 생성하는 방식
                    // removeBubble(log.modified.object);
                    // addBubble(log.origin.object, log.origin.childrenPaths);
                } else if (isLogCurve(log)) {
                    // TODO updateMutation반영 후 id 저장 필요
                    updateCurveMutation({
                        workspaceId: workspaceId,
                        bubbleId: log.modified.bubbleId,
                        curve: log.modified.object,
                    });
                }
                break;
            default:
                break;
        }
    };

    return { sendLogsToServer, commitToServer };
};
