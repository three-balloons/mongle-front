import { useCanvas } from '@/hooks/useCanvas';
import { useHand } from '@/hooks/useHand';
import { useCamera } from '@/objects/camera/useCamera';
import { useRenderer } from '@/objects/renderer/useRenderer';
import { useBubbleStore } from '@/store/bubbleStore';
import { useConfigStore } from '@/store/configStore';
import { WORKSPACE_INNER_HALF_SIZE, WORKSPACE_INNER_SIZE } from '@/util/constant';
import { useCallback, useEffect, useRef } from 'react';

type InputPoint = {
    type: string;
    clientX: number;
    clientY: number;
};

/**
 * touchState 관리
 * touchState에 의해 이동하는 경우, 이동 관련 함수 호출
 */
export const useTouch = () => {
    const setFocusBubblePath = useBubbleStore((state) => state.setFocusBubblePath);
    const { getMainLayer, getCameraView } = useRenderer();
    const { updateCameraView } = useCamera();
    const { grab, drag, release } = useHand();
    const { setupAction, executeAction, terminateAction } = useCanvas();

    const { isTouchDraw } = useConfigStore((state) => state);
    const isTouchDrawRef = useRef<boolean>(isTouchDraw);

    // 위치와 타입도 저장
    const currentPointersRef = useRef<Map<number, InputPoint>>(new Map());
    const initalPointersRef = useRef<Map<number, InputPoint>>(new Map());
    const touchStateRef = useRef<TouchState>('none');
    const zoomDistanceRef = useRef<number | null>(null); // zoom에 사용
    const zoomScaleRef = useRef<number>(1);

    useEffect(() => {
        useConfigStore.subscribe(({ isTouchDraw }) => {
            isTouchDrawRef.current = isTouchDraw;
        });
    }, []);

    // 두 손가락 사이의 거리를 계산하는 함수
    const calculateDistance = (touch1: InputPoint, touch2: InputPoint) => {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const touchDown = useCallback((event: PointerEvent) => {
        const mainLayer = getMainLayer();
        const currentInput: InputPoint = {
            type: event.pointerType,
            clientX: event.clientX,
            clientY: event.clientY,
        };
        currentPointersRef.current.set(event.pointerId, { ...currentInput });
        initalPointersRef.current.set(event.pointerId, currentInput);
        changeTouchState();
        if (touchStateRef.current == 'pan') {
            const currentPointerEventList = Array.from(currentPointersRef.current.values());
            if (mainLayer) {
                const position = getViewCoordinate(currentPointerEventList[0], mainLayer);
                grab(getCameraView(), position);
            }
        }
        if (mainLayer && touchStateRef.current == 'command') {
            const currentPosition = getViewCoordinate(currentInput, mainLayer);
            setupAction(currentPosition);
        }
        if (touchStateRef.current == 'pan' && isTouchDrawRef.current) terminateAction(true);
    }, []);

    const touch = useCallback((event: PointerEvent) => {
        const mainLayer = getMainLayer();
        const currentInput: InputPoint = {
            type: event.pointerType,
            clientX: event.clientX,
            clientY: event.clientY,
        };
        if (currentPointersRef.current.has(event.pointerId)) {
            currentPointersRef.current.set(event.pointerId, currentInput);
            changeTouchState();
        }
        const currentPointerEventList = Array.from(currentPointersRef.current.values());
        if (touchStateRef.current == 'pan') {
            if (mainLayer) {
                const position = getViewCoordinate(currentPointerEventList[0], mainLayer);
                drag(getCameraView(), position);
            }
        }

        if (touchStateRef.current == 'zoom') {
            if (zoomDistanceRef.current == null) {
                zoomDistanceRef.current = calculateDistance(currentPointerEventList[0], currentPointerEventList[1]);
            }
            zoom(zoomScaleRef.current * 50 - 50, false);
        }

        if (mainLayer && touchStateRef.current == 'command') {
            const currentPosition = getViewCoordinate(currentPointerEventList[0], mainLayer);
            executeAction(currentPosition);
        }
    }, []);

    const touchUp = useCallback((event: PointerEvent) => {
        initalPointersRef.current.delete(event.pointerId);
        currentPointersRef.current.delete(event.pointerId);
        const previousTouchState = touchStateRef.current;
        changeTouchState();
        // pan일때 2터치에서 1터치로 바뀌었을 때 => pan 동작 초기화
        if (touchStateRef.current == 'pan' && currentPointersRef.current.size == 1) {
            release();
            currentPointersRef.current.forEach((input, key) => initalPointersRef.current.set(key, input));
            // changeTouchState();
        }

        if (previousTouchState == 'pan' && touchStateRef.current != 'pan') {
            release();
        }

        if (previousTouchState == 'command' && touchStateRef.current != 'command') {
            if (touchStateRef.current == 'none') terminateAction(false);
            else terminateAction(true);
        }
    }, []);

    const getTouchState = () => {
        return touchStateRef.current;
    };

    // touch 상태 변경
    const changeTouchState = () => {
        const initalPointerEventList = Array.from(initalPointersRef.current.values());
        const currentPointerEventList = Array.from(currentPointersRef.current.values());

        if (
            initalPointersRef.current.size !== currentPointersRef.current.size ||
            initalPointersRef.current.size > 2 ||
            initalPointersRef.current.size == 0
        )
            touchStateRef.current = 'none';
        else if (
            currentPointerEventList.find((e) => e.type === 'pen' || currentPointerEventList[0].type == 'mouse') !=
            undefined
        ) {
            touchStateRef.current = 'command';
        } else if (currentPointersRef.current.size == 1) {
            // 'touch'
            if (isTouchDrawRef.current) touchStateRef.current = 'command';
            else touchStateRef.current = 'pan';
        } else if (currentPointersRef.current.size == 2) {
            const initalDistance = calculateDistance(initalPointerEventList[0], initalPointerEventList[1]);
            const currentDistance = calculateDistance(currentPointerEventList[0], currentPointerEventList[1]);
            if (zoomDistanceRef.current) {
                const scale = currentDistance / zoomDistanceRef.current;
                const changedScale = currentDistance / initalDistance;
                zoomDistanceRef.current = currentDistance;
                if (0.7 <= changedScale && changedScale <= 1.3 && touchStateRef.current == 'pan') {
                    touchStateRef.current = 'pan';
                } else {
                    touchStateRef.current = 'zoom';
                }
                zoomScaleRef.current = scale;
            } else {
                zoomDistanceRef.current = currentDistance;
                touchStateRef.current = 'pan';
            }
        } else {
            touchStateRef.current = 'none';
        }

        if (touchStateRef.current != 'pan' && touchStateRef.current != 'zoom') zoomDistanceRef.current = null;
    };

    const getViewCoordinate = (inputPoint: InputPoint, canvas: HTMLCanvasElement): Vector2D => {
        return {
            x: Math.round(inputPoint.clientX) - canvas.offsetLeft,
            y: Math.round(inputPoint.clientY) - canvas.offsetTop,
        };
    };

    const zoom = (intensity: number, showAnimation?: boolean) => {
        setFocusBubblePath(undefined);
        const cameraView = getCameraView();
        updateCameraView(
            {
                ...cameraView,
                pos: {
                    left: cameraView.pos.left + (cameraView.pos.width * intensity) / WORKSPACE_INNER_SIZE,
                    top: cameraView.pos.top + (cameraView.pos.height * intensity) / WORKSPACE_INNER_SIZE,
                    width: (cameraView.pos.width * (WORKSPACE_INNER_HALF_SIZE - intensity)) / WORKSPACE_INNER_HALF_SIZE,
                    height:
                        (cameraView.pos.height * (WORKSPACE_INNER_HALF_SIZE - intensity)) / WORKSPACE_INNER_HALF_SIZE,
                },
            },
            showAnimation ? { ...cameraView } : undefined,
        );
    };

    return { touchDown, touch, touchUp, getTouchState };
};
