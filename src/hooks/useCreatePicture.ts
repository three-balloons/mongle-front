import { usePicture } from '@/objects/picture/usePicture';
import { useRenderer } from '@/objects/renderer/useRenderer';
import { useBubbleStore } from '@/store/bubbleStore';
import { MINIMUN_RENDERED_BUBBLE_RATE } from '@/util/constant';
import { view2Point } from '@/util/coordSys/conversion';

import { useRef } from 'react';

/**
 * picture 터치 확인
 * picture 선택
 */
export const useCreatePicture = () => {
    const startCreatingPicturePosRef = useRef<Vector2D | undefined>(undefined);
    const creatingPicturePathRef = useRef<string>('/');

    const setFocusBubblePath = useBubbleStore((state) => state.setFocusBubblePath);
    const { setDraggingRect, getDraggingRect, reRender } = useRenderer();
    const view2BubbleWithRect = useBubbleStore((state) => state.view2BubbleWithRect);
    const findBubbleByPath = useBubbleStore((state) => state.findBubbleByPath);
    const getRatioWithCamera = useBubbleStore((state) => state.getRatioWithCamera);
    const { getCreatingPicture } = usePicture();

    const startCreatePicture = (cameraView: ViewCoord, currentPosition: Vector2D, path: string) => {
        const pos = view2Point(
            {
                x: currentPosition.x,
                y: currentPosition.y,
            },
            cameraView,
        );
        // 저장시 cameraView 좌표계로 저장
        if (pos) startCreatingPicturePosRef.current = pos;
        creatingPicturePathRef.current = path;
        setFocusBubblePath(path);
        reRender();
    };

    const createPicture = (cameraView: ViewCoord, pos: Vector2D) => {
        const currentPosition = view2Point(
            {
                x: pos.x,
                y: pos.y,
            },
            cameraView,
        );
        if (startCreatingPicturePosRef.current) {
            const { x, y } = startCreatingPicturePosRef.current;
            const currentRect: Rect = {
                top: Math.min(currentPosition.y, y),
                left: Math.min(currentPosition.x, x),
                height: Math.abs(currentPosition.y - y),
                width: Math.abs(currentPosition.x - x),
            };
            setDraggingRect(currentRect);
        }
    };

    const finishCreatePicture = (cameraView: ViewCoord) => {
        const bubbleRect = getDraggingRect();
        if (!bubbleRect) return;
        const ratio = getRatioWithCamera({ ...bubbleRect, path: creatingPicturePathRef.current } as Bubble, cameraView);
        if (!ratio || ratio * 2 < MINIMUN_RENDERED_BUBBLE_RATE) {
            console.error('생성하려는 사진의 크기가 너무 작습니다');
            return;
        }
        const rect =
            creatingPicturePathRef.current === '/'
                ? bubbleRect
                : view2BubbleWithRect(bubbleRect, cameraView, creatingPicturePathRef.current);
        const creatingPicture = getCreatingPicture();
        if (creatingPicture)
            addPictureInBubble(
                { ...creatingPicture, ...rect, type: 'picture', isFlippedX: false, isFlippedY: false },
                creatingPicturePathRef.current,
            );

        setDraggingRect(undefined);
    };

    const addPictureInBubble = (picture: Picture, path: string) => {
        const bubble = findBubbleByPath(path);
        if (bubble) {
            bubble.shapes = [...bubble.shapes, picture];
        }
        // TODO logging
    };

    return { startCreatePicture, createPicture, finishCreatePicture };
};
