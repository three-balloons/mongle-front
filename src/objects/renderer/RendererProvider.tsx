import { useCamera } from '@/objects/camera/useCamera';
import { useCurve } from '@/objects/curve/useCurve';
import { useLog } from '@/objects/log/useLog';
import { usePicture } from '@/objects/picture/usePicture';
import { useBubbleStore } from '@/store/bubbleStore';
import { useConfigStore } from '@/store/configStore';
import { useViewStore } from '@/store/viewStore';
import {
    MINIMUN_RENDERED_BUBBLE_RATE,
    OFF_SCREEN_HEIGHT,
    OFF_SCREEN_WIDTH,
    WORKSPACE_INNER_HALF_SIZE,
} from '@/util/constant';
import { bubble2globalWithCurve, bubble2globalWithRect, curve2View, rect2View } from '@/util/coordSys/conversion';
import { getThemeMainColor, getThemeSecondColor } from '@/util/getThemeStyle';
import { catmullRom2Bezier } from '@/util/shapes/conversion';
import { easeInOutCubic } from '@/util/transition/transtion';
import { createContext, useEffect, useRef } from 'react';

export type RendererContextProps = {
    /* canvas layer */
    mainLayerRef: React.RefObject<HTMLCanvasElement>;
    creationLayerRef: React.RefObject<HTMLCanvasElement>;
    movementLayerRef: React.RefObject<HTMLCanvasElement>;
    interfaceLayerRef: React.RefObject<HTMLCanvasElement>;

    getCameraView: () => ViewCoord;
    getMainLayer: () => HTMLCanvasElement | null;

    /** created & edited objects */
    getDraggingRect: () => Rect | undefined;
    setDraggingRect: (rect: Rect | undefined) => void;
    getEditingRect: () => Rect | undefined;
    setEditingRect: (rect: Rect | undefined) => void;

    /** renderers */
    bubbleTransitAnimation: (
        bubble: Bubble,
        startBubblePos: Vector2D,
        endBubblePos: Vector2D,
        duration?: number,
    ) => void;
    reRender: () => void;
    lineRenderer: (startPoint: Vector2D, endPoint: Vector2D) => void;
    curveRenderer: (curve: Curve2D) => void;
    eraseRender: (curretPosition: Vector2D) => void;
    renderer: () => void;
    draggingRectRender: (rect: Rect) => void;
    bubbleRender: (bubble: Bubble) => void;
    movementBubbleRender: () => void;
};

export const RendererContext = createContext<RendererContextProps | undefined>(undefined);

type RendererProviderProps = {
    children: React.ReactNode;
    isReadyToShow: boolean;
    theme?: Theme;
};

export const RendererProvider: React.FC<RendererProviderProps> = ({ children, isReadyToShow, theme = '하늘' }) => {
    const { isShowBubble, eraseConfig } = useConfigStore((state) => state);
    const { setMode } = useConfigStore((state) => state);
    const isShowBubbleRef = useRef<boolean>(isShowBubble);
    const ereaseRadiusRef = useRef(eraseConfig.radius);

    const draggingRectRef = useRef<Rect | undefined>(undefined);
    const editingRectRef = useRef<Rect | undefined>(undefined);

    /** layers */
    const mainLayerRef = useRef<HTMLCanvasElement>(null);
    const creationLayerRef = useRef<HTMLCanvasElement>(null); // 그릴때 사용하는 레이어
    const movementLayerRef = useRef<HTMLCanvasElement>(null); // 이동할때 쓰이는 레이어
    const interfaceLayerRef = useRef<HTMLCanvasElement>(null); // 이동할때 쓰이는 레이어

    // use for animation
    const modeRef = useRef<ControlMode>('none');

    const { getNewCurvePath, removeCurve, applyPenConfig, setThicknessWithRatio, getSelectedCurve } = useCurve();
    const { getSelectedPictures } = usePicture();
    const getFocusBubblePath = useBubbleStore((state) => state.getFocusBubblePath);
    const getBubbles = useBubbleStore((state) => state.getBubbles);
    const findBubbleByPath = useBubbleStore((state) => state.findBubbleByPath);
    const descendant2child = useBubbleStore((state) => state.descendant2child);
    const getRatioWithCamera = useBubbleStore((state) => state.getRatioWithCamera);
    const { addCurveDeletionLog } = useLog();
    const { getCameraView } = useCamera();

    useEffect(() => {
        // Rerenders when canvas view changes
        useViewStore.subscribe((state) => {
            if (state.cameraView) {
                reRender();
            }
        });
        useConfigStore.subscribe(({ isShowBubble, eraseConfig, mode }) => {
            isShowBubbleRef.current = isShowBubble;
            modeRef.current = mode;
            ereaseRadiusRef.current = eraseConfig.radius;
        });
    }, []);

    useEffect(() => {
        if (isReadyToShow) reRender();
    }, [isReadyToShow]);

    const getMainLayer = () => {
        return mainLayerRef.current;
    };

    const setDraggingRect = (rect: Rect | undefined) => {
        draggingRectRef.current = rect;
    };

    const getDraggingRect = () => {
        return draggingRectRef.current;
    };

    const setEditingRect = (rect: Rect | undefined) => {
        editingRectRef.current = rect;
    };

    const getEditingRect = () => {
        return editingRectRef.current;
    };

    const bubbleTransitAnimation = (
        bubble: Bubble,
        startBubblePos: Vector2D,
        endBubblePos: Vector2D,
        duration: number = 500,
    ) => {
        let time = 0;
        const prevMode = modeRef.current;
        setMode('animate');
        const intervalId = setInterval(() => {
            const pos = easeInOutCubic(time / duration, startBubblePos, endBubblePos);
            bubble.top = pos.y;
            bubble.left = pos.x;
            movementBubbleRender();
            time += 30;
            if (time >= duration) {
                setMode(prevMode);
                clearInterval(intervalId);
            }
        }, 30);
    };

    const reRender = () => {
        // TODO 좌표 보정하기
        if (creationLayerRef.current) clearLayerRenderer(creationLayerRef.current);
        if (movementLayerRef.current) clearLayerRenderer(movementLayerRef.current);
        renderer();

        editingRectRef.current && draggingRectRender(editingRectRef.current);
        // movementBubbleRender();
    };

    const clearLayerRenderer = (canvas: HTMLCanvasElement) => {
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    /**
     * bezier curve 적용 전 - 픽셀 단위로 그리기
     */
    const lineRenderer = (startPoint: Vector2D, endPoint: Vector2D) => {
        if (!creationLayerRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = creationLayerRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            applyPenConfig(context);
            setThicknessWithRatio(context, 1);
            context.beginPath();
            context.moveTo(startPoint.x, startPoint.y);
            context.lineTo(endPoint.x, endPoint.y);
            context.stroke();
        }
    };

    /**
     * addControlPoint가 true일 때 실행
     * creating curve rendering
     */
    const curveRenderer = (curve: Curve2D) => {
        if (!creationLayerRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = creationLayerRef.current;
        const context = canvas.getContext('2d');
        const cameraView = getCameraView();
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            applyPenConfig(context);

            const parentBubble = findBubbleByPath(getNewCurvePath());
            let c = curve;
            if (parentBubble) {
                const bubbleView = descendant2child(parentBubble, cameraView.path);
                c = bubble2globalWithCurve(curve, bubbleView);
            }
            const beziers = catmullRom2Bezier(curve2View(c, cameraView));
            context.beginPath();
            // TODO: 실제 커브를 그리는 부분과 그릴지 말지 결정하는 부분 분리 할 것
            if (beziers.length > 0) {
                for (let i = 0; i < beziers.length; i++) {
                    context.moveTo(beziers[i].start.x, beziers[i].start.y);
                    if (beziers[i].start.isVisible)
                        context.bezierCurveTo(
                            beziers[i].cp1.x,
                            beziers[i].cp1.y,
                            beziers[i].cp2.x,
                            beziers[i].cp2.y,
                            beziers[i].end.x,
                            beziers[i].end.y,
                        );
                }
            }
            context.stroke();
        }
    };

    const eraseRender = (curretPosition: Vector2D) => {
        if (!mainLayerRef.current) return;
        const canvas: HTMLCanvasElement = mainLayerRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            context.strokeStyle = 'gray';
            context.lineWidth = 1;
            context.beginPath();
            context.arc(curretPosition.x, curretPosition.y, ereaseRadiusRef.current, 0, Math.PI * 2);
            context.stroke();
        }
    };

    /**
     * rendering in main layer
     */
    const renderer = () => {
        if (!mainLayerRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = mainLayerRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            const bubbles = [...getBubbles()];
            for (const bubble of bubbles) {
                bubbleRender(bubble);
            }
        }
    };

    /**
     * usage: create bubble drag
     */
    const draggingRectRender = (rect: Rect) => {
        if (!creationLayerRef.current) return;
        const canvas: HTMLCanvasElement = creationLayerRef.current;
        const context = canvas.getContext('2d');
        const _rect: Rect = rect2View(rect, getCameraView());
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath(); // Start a new path
            context.lineWidth = 5;
            context.strokeStyle = getThemeSecondColor(theme);
            context.setLineDash([10, 10]);
            context.strokeRect(_rect.left, _rect.top, _rect.width, _rect.height); // Render the path
            context.setLineDash([]);
        }
    };

    /**
     * bubble과 그 내부의 요소를 렌더링함
     */
    const bubbleRender = (bubble: Bubble) => {
        const cameraView = getCameraView();
        const ratio = getRatioWithCamera(bubble, cameraView);
        if (ratio && ratio < MINIMUN_RENDERED_BUBBLE_RATE) {
            return;
        }
        if (!mainLayerRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = mainLayerRef.current;
        const context = canvas.getContext('2d');
        const isSamePath = bubble.path === cameraView.path;
        const bubbleView = descendant2child(bubble, cameraView.path);
        if (bubbleView == undefined && !isSamePath) return;

        if (context) {
            if (getFocusBubblePath() === bubble.path) {
                context.strokeStyle = getThemeMainColor(theme);
            } else {
                context.strokeStyle = getThemeSecondColor(theme);
            }
            // camera안에 잡힌 버블은 완전 생성
            if (bubbleView && (isShowBubbleRef.current || getFocusBubblePath() === bubble.path)) {
                const rect: Rect = rect2View(
                    {
                        height: bubbleView.height,
                        width: bubbleView.width,
                        top: bubbleView.top,
                        left: bubbleView.left,
                    },
                    cameraView,
                );
                const x = Math.min(rect.width + rect.left, rect.left);
                const y = Math.min(rect.height + rect.top, rect.top);
                const cornerRadius = Math.floor(Math.min(rect.width, rect.height) / (WORKSPACE_INNER_HALF_SIZE / 10));
                context.beginPath();
                context.moveTo(x + cornerRadius, y);
                context.lineTo(x + rect.width - cornerRadius, y);
                context.quadraticCurveTo(x + rect.width, y, x + rect.width, y + cornerRadius);
                context.lineTo(x + rect.width, y + rect.height - cornerRadius);
                context.quadraticCurveTo(
                    x + rect.width,
                    y + rect.height,
                    x + rect.width - cornerRadius,
                    y + rect.height,
                );
                context.lineTo(x + cornerRadius, y + rect.height);
                context.quadraticCurveTo(x, y + rect.height, x, y + rect.height - cornerRadius);
                context.lineTo(x, y + cornerRadius);
                context.quadraticCurveTo(x, y, x + cornerRadius, y);
                context.closePath();
                context.lineWidth = 3;
                context.stroke();
                // bubble name
                context.font = '12px monggeulR';

                context.fillStyle = 'red';
                context.fillText('⊗', rect.left, rect.top - 8);
                const metrics = context.measureText('⊗');
                context.fillStyle = 'black';
                context.fillText(bubble.name, rect.left + metrics.width + 4, rect.top - 8);
                const metricName = context.measureText('⊗ ' + bubble.name);
                bubble.nameSizeInCanvas = metricName.width;
            }
            bubble.shapes.forEach((shape) => {
                if (shape.type === 'curve') {
                    const curve = shape;
                    const c = bubble2globalWithCurve(curve.position, bubbleView);

                    const beziers = catmullRom2Bezier(curve2View(c, cameraView));
                    applyPenConfig(context, curve.config);
                    const ratio = getRatioWithCamera(bubble, cameraView);
                    if (!ratio) {
                        console.log('ratio 에러', bubble.path);
                        return;
                    }

                    setThicknessWithRatio(context, ratio);
                    if (getSelectedCurve().find((cuv) => cuv === curve)) {
                        context.shadowBlur = 5;
                    } else {
                        context.shadowBlur = 0;
                    }
                    context.beginPath();
                    // TODO: 실제 커브를 그리는 부분과 그릴지 말지 결정하는 부분 분리 할 것
                    if (beziers.length > 0) {
                        let isSweep = true;
                        for (let i = 0; i < beziers.length; i++) {
                            context.moveTo(beziers[i].start.x, beziers[i].start.y);
                            if (beziers[i].start.isVisible) {
                                context.bezierCurveTo(
                                    beziers[i].cp1.x,
                                    beziers[i].cp1.y,
                                    beziers[i].cp2.x,
                                    beziers[i].cp2.y,
                                    beziers[i].end.x,
                                    beziers[i].end.y,
                                );
                                isSweep = false;
                            }
                        }
                        // TODO sweep 로직 다른 곳으로 옮기기
                        if (isSweep) {
                            removeCurve(bubble.id, curve);
                            addCurveDeletionLog(curve, bubble.id);
                            // commitLog();
                        }
                    }
                    context.stroke();
                } else if (shape.type === 'picture') {
                    const picture = shape;
                    if (getSelectedPictures().find((pic) => pic == picture)) context.shadowBlur = 5;
                    else context.shadowBlur = 0;
                    const position = rect2View(bubble2globalWithRect(picture as Rect, bubbleView), cameraView);
                    const ctx = picture.offScreen?.getContext('2d');
                    ctx?.drawImage(picture.image, 0, 0, OFF_SCREEN_WIDTH, OFF_SCREEN_HEIGHT);
                    const imageBitmap = picture.offScreen?.transferToImageBitmap(); // for android webview
                    if (imageBitmap)
                        context.drawImage(imageBitmap, position.left, position.top, position.width, position.height);
                }
                context.shadowBlur = 0;
            });
        }
    };

    const movementBubbleRender = () => {
        const cameraView = getCameraView();
        if (!movementLayerRef.current) {
            return;
        }
        const canvas: HTMLCanvasElement = movementLayerRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            getBubbles().forEach((bubble) => {
                const ratio = getRatioWithCamera(bubble, cameraView);
                if (ratio && ratio * cameraView.size.x < MINIMUN_RENDERED_BUBBLE_RATE) {
                    return;
                }
                const bubbleView = descendant2child(bubble, cameraView.path);
                if (bubbleView == undefined) return;
                const rect: Rect = rect2View(
                    {
                        height: bubbleView.height,
                        width: bubbleView.width,
                        top: bubbleView.top,
                        left: bubbleView.left,
                    },
                    cameraView,
                );

                context.strokeStyle = getThemeSecondColor(theme);
                context.lineWidth = 3;
                context.strokeRect(rect.left, rect.top, rect.width, rect.height);

                context.stroke();
            });
        }
    };

    return (
        <RendererContext.Provider
            value={{
                mainLayerRef,
                creationLayerRef,
                movementLayerRef,
                interfaceLayerRef,
                getCameraView,
                getMainLayer,
                setDraggingRect,
                getDraggingRect,
                setEditingRect,
                getEditingRect,
                bubbleTransitAnimation,
                reRender,
                lineRenderer,
                curveRenderer,
                eraseRender,
                renderer,
                draggingRectRender,
                bubbleRender,
                movementBubbleRender,
            }}
        >
            {children}
        </RendererContext.Provider>
    );
};
