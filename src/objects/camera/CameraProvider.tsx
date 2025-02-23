import { useBubbleStore } from '@/store/bubbleStore';
import { useConfigStore } from '@/store/configStore';
import { useViewStore } from '@/store/viewStore';
import { bubble2globalWithRect, global2bubbleWithRect } from '@/util/coordSys/conversion';
import { getLCAPath, getParentPath } from '@/util/path/path';
import { easeInCubic, easeOutCubic } from '@/util/transition/transtion';
import { createContext, useEffect, useRef } from 'react';

export type CameraContextProps = {
    setCameraView: (cameraView: ViewCoord) => void;
    getCameraView: () => ViewCoord;
    zoomBubble: (bubblePath: string) => ViewCoord | undefined;
    updateCameraView: (cameraView: ViewCoord, prevCamera?: ViewCoord | undefined) => void;
};

export const CameraContext = createContext<CameraContextProps | undefined>(undefined);

type CameraProviderProps = {
    children: React.ReactNode;
    height?: number;
    width?: number;
};

export const CameraProvider: React.FC<CameraProviderProps> = ({ children, height = 0, width = 0 }) => {
    const { setCameraView } = useViewStore((state) => state);
    const { mode, setMode } = useConfigStore((state) => state);
    const { isShowAnimation } = useConfigStore((state) => state);
    const isShowAnimationRef = useRef<boolean>(isShowAnimation);
    const modeRef = useRef<ControlMode>('none');

    const findBubbleByPath = useBubbleStore((state) => state.findBubbleByPath);
    const descendant2child = useBubbleStore((state) => state.descendant2child);
    const getChildBubbles = useBubbleStore((state) => state.getChildBubbles);

    const cameraViewRef = useRef<ViewCoord>({
        pos: {
            top: -height / 2,
            left: -width / 2,
            width: width,
            height: height,
        },
        size: {
            x: width,
            y: height,
        },
        path: '/',
    });

    // 카메라 size 변경
    useEffect(() => {
        setCameraView({
            ...cameraViewRef.current,
            pos: {
                top: -height / 2,
                left: -width / 2,
                width: width,
                height: height,
            },
            size: { x: width, y: height },
        });
    }, [width, height]);
    useEffect(() => {
        setCameraView(cameraViewRef.current);
        // Rerenders when canvas view changes
        useViewStore.subscribe(({ cameraView }) => {
            cameraViewRef.current = cameraView;
        });
        useConfigStore.subscribe(({ isShowAnimation }) => {
            isShowAnimationRef.current = isShowAnimation;
        });
    }, []);

    // 카메라를 root로 올리고 parentBubble로 다시 내림
    const zoomBubble = (bubblePath: string) => {
        const bubble = findBubbleByPath(bubblePath);
        if (bubble == undefined) return;

        const prevCamera: ViewCoord = { ...cameraViewRef.current };
        let newCameraPos: Rect = { ...cameraViewRef.current.pos };
        let cameraPath: string | undefined = cameraViewRef.current.path;

        // const parentBubble = descendant2child(parentBubble, '/');
        // let ret: Rect = { ...newCameraPos };
        while (cameraPath && cameraPath != '/') {
            const cameraBubble = findBubbleByPath(cameraPath);
            if (cameraBubble == undefined) return undefined;
            newCameraPos.top = (cameraBubble.height * (100 + newCameraPos.top)) / 200 + cameraBubble.top;
            newCameraPos.left = (cameraBubble.width * (100 + newCameraPos.left)) / 200 + cameraBubble.left;
            newCameraPos.height = (cameraBubble.height * newCameraPos.height) / 200;
            newCameraPos.width = (cameraBubble.width * newCameraPos.width) / 200;
            cameraPath = getParentPath(cameraPath);
        }
        const parentPath = getParentPath(bubblePath);
        if (parentPath != undefined) {
            const parentBubble = findBubbleByPath(parentPath);
            if (parentBubble) {
                const bubbleView = descendant2child(parentBubble, '/');
                newCameraPos = global2bubbleWithRect(newCameraPos, bubbleView);
            }
        }
        const tmp = descendant2child(bubble, '/') as Bubble;
        const visibleBubblePos = {
            height: tmp.height,
            width: tmp.width,
            top: tmp.top,
            left: tmp.left,
        };

        const isLongHeight: boolean =
            visibleBubblePos.width * cameraViewRef.current.size.y <
            visibleBubblePos.height * cameraViewRef.current.size.x;
        // 최대 크기의 91%
        const newHeight = isLongHeight
            ? bubble.height * 1.1
            : (bubble.width * newCameraPos.height * 1.1) / newCameraPos.width;
        const newWidth = isLongHeight
            ? (bubble.height * newCameraPos.width * 1.1) / newCameraPos.height
            : bubble.width * 1.1;
        const newCameraView: ViewCoord = {
            size: cameraViewRef.current.size,
            pos: {
                top: bubble.top + (bubble.height - newHeight) / 2,
                left: bubble.left + (bubble.width - newWidth) / 2,
                height: newHeight,
                width: newWidth,
            },
            path: getParentPath(bubblePath) ?? '/',
        };
        updateCameraView(newCameraView, prevCamera);
        return newCameraView;
    };

    /**
     * cameraView에 대한 모든 책임
     * camera를 path에 맞게 변경하고 vameraView를 설정
     * animation 적용 여부 결정
     * prevPosition이 없는 경우 애니메이션 적용 X
     */
    const updateCameraView = (cameraView: ViewCoord, prevCamera?: ViewCoord | undefined) => {
        let path = cameraView.path;
        let pos = { ...cameraView.pos };
        const prevCam: ViewCoord | undefined = prevCamera ? { ...prevCamera } : undefined;

        while (
            path != '/' &&
            (pos.top < -100 || pos.left < -100 || pos.top + pos.height > 100 || pos.left + pos.width > 100)
        ) {
            pos = bubble2globalWithRect(pos, findBubbleByPath(path));
            // TODO prevPos 설정 로직 분리
            // if (prevPos) prevPos = bubble2globalWithRect(prevPos, findBubble(path));
            path = getParentPath(path) ?? '/';
        }
        let canUpdateCamera = true;
        while (canUpdateCamera) {
            canUpdateCamera = false;

            const children = getChildBubbles(path);
            for (const child of children) {
                // TODO isInside 유틸함수 만들기
                if (
                    child.top < pos.top &&
                    child.left < pos.left &&
                    pos.top + pos.height < child.top + child.height &&
                    pos.left + pos.width < child.left + child.width
                ) {
                    pos = global2bubbleWithRect(pos, child);
                    // TODO prevPos 설정 로직 분리
                    // if (prevPos) prevPos = global2bubbleWithRect(prevPos, child);
                    path = child.path;
                    canUpdateCamera = true;
                    break;
                }
            }
        }
        /**
         * path: update후 최종 path
         * pos: update후 최종 pos(path기준)
         * prevPos: 초기 pos(최종 path 기준)
         */
        // path와 prev

        if (prevCam && isShowAnimationRef.current) {
            const lcaPath = getParentPath(getLCAPath(path, prevCam.path)) ?? '/';
            // prevPos를 lca까지 올림
            const prevPos = { ...prevCam.pos };
            let prevPath: string | undefined = prevCam.path;
            while (prevPath && prevPath !== '/' && prevPath !== lcaPath) {
                const cameraBubble = findBubbleByPath(prevPath);
                if (cameraBubble == undefined) return undefined;
                prevPos.top = (cameraBubble.height * (100 + prevPos.top)) / 200 + cameraBubble.top;
                prevPos.left = (cameraBubble.width * (100 + prevPos.left)) / 200 + cameraBubble.left;
                prevPos.height = (cameraBubble.height * prevPos.height) / 200;
                prevPos.width = (cameraBubble.width * prevPos.width) / 200;
                prevPath = getParentPath(prevPath);
            }
            // currentPos를 lca까지 올림
            const currentPos = { ...pos };
            let currentPath: string | undefined = path;
            while (currentPath && currentPath !== '/' && currentPath !== lcaPath) {
                const cameraBubble = findBubbleByPath(currentPath);
                if (cameraBubble == undefined) return undefined;
                currentPos.top = (cameraBubble.height * (100 + currentPos.top)) / 200 + cameraBubble.top;
                currentPos.left = (cameraBubble.width * (100 + currentPos.left)) / 200 + cameraBubble.left;
                currentPos.height = (cameraBubble.height * currentPos.height) / 200;
                currentPos.width = (cameraBubble.width * currentPos.width) / 200;
                currentPath = getParentPath(currentPath);
            }
            if (prevPos && currentPos) {
                setCameraView({
                    size: cameraView.size,
                    path: lcaPath,
                    pos: {
                        top: prevPos.top,
                        left: prevPos.left,
                        height: prevPos.height,
                        width: prevPos.width,
                    },
                });
                viewTransitAnimation(
                    { top: prevPos.top, left: prevPos.left, width: prevPos.width, height: prevPos.height },
                    { top: currentPos.top, left: currentPos.left, width: currentPos.width, height: currentPos.height },
                    {
                        size: cameraView.size,
                        path,
                        pos,
                    },
                    600,
                );
            }
            return;
        }
        // 애니메이션 적용 안하거나 prevCam이 없는 경우, 오류가 생긴경우
        setCameraView({
            size: cameraView.size,
            path,
            pos,
        });
    };

    /**
     *
     * @param startViewPos 시작 view의 위치(공통부모 기준)
     * @param endViewPos 최종 view의 위치(공통부모 기준)
     * @param finalView 마지막에 적용되어야할 CameraView
     * @param duration 애니메이션 길이(ms)
     */
    const viewTransitAnimation = (
        startViewPos: Rect,
        endViewPos: Rect,
        finalView: ViewCoord,
        duration: number = 1000,
    ) => {
        let time = 0;
        modeRef.current = mode;
        setMode('animate');
        const top = Math.min(startViewPos.top, endViewPos.top);
        const left = Math.min(startViewPos.left, endViewPos.left);
        const height = Math.max(startViewPos.top + startViewPos.height, endViewPos.top + endViewPos.height) - top;
        const width = Math.max(startViewPos.left + startViewPos.width, endViewPos.left + endViewPos.width) - left;

        const isLongHeight = height * finalView.size.x > width * finalView.size.y ? true : false;
        const newHeight = isLongHeight ? height : (width * finalView.size.y) / finalView.size.x;
        const newWidth = isLongHeight ? (height * finalView.size.x) / finalView.size.y : width;
        const middleViewPos: Rect = {
            top: top + (height - newHeight) / 2,
            left: left + (width - newWidth) / 2,
            height: newHeight,
            width: newWidth,
        };
        const intervalId = setInterval(() => {
            let pos: Rect;
            if (time < duration / 2) {
                pos = easeOutCubic(time / duration, startViewPos, middleViewPos);
            } else {
                pos = easeInCubic(time / duration, middleViewPos, endViewPos);
            }
            setCameraView({ ...cameraViewRef.current, pos: pos });
            if (time >= duration) {
                // setCameraView({ ...cameraViewRef.current, pos: endViewPos });
                setCameraView({ ...finalView });
                setMode(modeRef.current);
                clearInterval(intervalId);
            }
            time += 30;
        }, 30);
    };

    return (
        <CameraContext.Provider
            value={{
                getCameraView: () => cameraViewRef.current,
                setCameraView: setCameraView,
                zoomBubble,
                updateCameraView,
            }}
        >
            {children}
        </CameraContext.Provider>
    );
};
