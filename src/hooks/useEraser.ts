import { useCallback, useEffect, useRef } from 'react';
import { useCurve } from '@/objects/curve/useCurve';
import { view2Point } from '@/util/coordSys/conversion';
import { curve2Rect } from '@/util/shapes/conversion';
import { isCollisionCapsuleWithCircle, isCollisionRectWithCircle } from '@/util/shapes/collision';
import { useConfigStore } from '@/store/configStore';
import { useLog } from '@/objects/log/useLog';
import { useBubbleStore } from '@/store/bubbleStore';

type CurveAndEraser = {
    id: number;
    curve: Curve;
    eraser: Circle;
};

/**
 * eraser 좌표를 버블 좌표로 바꿔서 계산
 * functions about erasing
 * @function erase
 * @returns
 */
export const useEraser = () => {
    const positionRef = useRef<Vector2D | undefined>();
    const { eraseConfig } = useConfigStore((state) => state);
    const earseModeRef = useRef<EraseMode>(eraseConfig.mode);
    const earseRadiusRef = useRef<number>(eraseConfig.radius);
    const earseAreaCurves = useRef<Array<{ origin: Curve; earsed: Curve; isModified: boolean }>>([]);
    const { removeCurve, removeCurvesWithId, updateCurve } = useCurve();

    const view2BubbleWithVector2D = useBubbleStore((state) => state.view2BubbleWithVector2D);
    const removeBubble = useBubbleStore((state) => state.removeBubble);
    const getChildBubbles = useBubbleStore((state) => state.getChildBubbles);
    const getDescendantBubbles = useBubbleStore((state) => state.getDescendantBubbles);
    const getRatioWithCamera = useBubbleStore((state) => state.getRatioWithCamera);
    const identifyTouchRegion = useBubbleStore((state) => state.identifyTouchRegion);

    /* logs */
    const { commitLog, addCurveDeletionLog, addCurveUpdateLog, addBubbleDeletionLog } = useLog();

    useEffect(() => {
        useConfigStore.subscribe(({ eraseConfig }) => {
            earseModeRef.current = eraseConfig.mode;
            earseRadiusRef.current = eraseConfig.radius;
        });
    }, []);

    const startErase = useCallback((cameraView: ViewCoord) => {
        // TODO 영역지우개일때 log 반영
        if (earseModeRef.current == 'area') {
            const descendants = getDescendantBubbles(cameraView.path);
            earseAreaCurves.current = descendants.flatMap((descendant) =>
                descendant.shapes
                    .filter((shape) => shape.type === 'curve')
                    .map((curve) => {
                        return { origin: { ...curve }, earsed: curve, isModified: false };
                    }),
            );
        }
    }, []);

    const erase = useCallback((cameraView: ViewCoord, currentPosition: Vector2D) => {
        if (earseModeRef.current == 'area') eraseArea(cameraView, currentPosition);
        else if (earseModeRef.current == 'stroke') eraseStroke(cameraView, currentPosition);
        else {
            const { region, bubble } = identifyTouchRegion(cameraView, currentPosition);
            if (region == 'inside' && bubble) {
                eraseBubble(bubble);
            }
        }
    }, []);

    const endErase = useCallback(() => {
        commitLog();
    }, []);

    const eraseArea = (cameraView: ViewCoord, currentPosition: Vector2D) => {
        positionRef.current = currentPosition;

        // 카메라뷰 밑 버블 가져오기
        const descendants = getDescendantBubbles(cameraView.path);
        // 버블에 있는 커브마다 지우개 설정(local 좌표계로)
        const curveWithErasers = descendants.flatMap((descendant) => {
            return findIntersectCurves(
                descendant.shapes
                    .filter((shape) => shape.type === 'curve')
                    .map((curve) => {
                        const position = view2Point(currentPosition, cameraView);
                        const pos = view2BubbleWithVector2D(position, cameraView, descendant.path);
                        const scale = (getRatioWithCamera(descendant, cameraView) ?? 1) * 4;
                        return {
                            id: descendant.id,
                            curve: curve,
                            eraser: {
                                center: {
                                    x: pos.x,
                                    y: pos.y,
                                },
                                radius: earseRadiusRef.current / scale,
                            },
                        };
                    }),
            );
        });

        // 지워주면 됨 => log가 생기면 log씌움
        curveWithErasers.forEach(({ id, curve, eraser }) => {
            const temp = markCurveWithEraser(eraser, curve);
            updateCurve(id, temp);
            // removeCurve(path, curve);
            // addCurve(path, temp);
            // TODO update curve
            addCurveUpdateLog(curve, temp, id, id);
        });
    };

    const eraseStroke = (cameraView: ViewCoord, currentPosition: Vector2D) => {
        positionRef.current = currentPosition;

        // 카메라뷰 밑 버블 가져오기
        const descendants = getDescendantBubbles(cameraView.path);
        // 버블에 있는 커브마다 지우개 설정(local 좌표계로)
        const curveWithErasers = descendants.flatMap((descendant) => {
            return findIntersectCurves(
                descendant.shapes
                    .filter((shape) => shape.type === 'curve')
                    .map((curve) => {
                        const position = view2Point(currentPosition, cameraView);
                        const pos = view2BubbleWithVector2D(position, cameraView, descendant.path);
                        const scale = (getRatioWithCamera(descendant, cameraView) ?? 1) * 2;
                        return {
                            id: descendant.id,
                            curve: curve,
                            eraser: {
                                center: {
                                    x: pos.x,
                                    y: pos.y,
                                },
                                radius: earseRadiusRef.current * scale,
                            },
                        };
                    }),
            );
        });

        curveWithErasers.forEach(({ id, curve, eraser }) => {
            if (isIntersectCurveWithEraser(eraser, curve)) {
                removeCurve(id, curve);
                addCurveDeletionLog(curve, id);
            }
        });
    };

    const eraseBubble = (bubble: Bubble) => {
        // TODO 경고 창 띄우고 지우기
        // setEraseMode('area');
        const ereaseChildBubble = (bubble: Bubble) => {
            const children = getChildBubbles(bubble.path);
            addBubbleDeletionLog(bubble, [...children.map((child) => child.id)]);
            children.forEach((child) => {
                ereaseChildBubble(child);
            });
            removeCurvesWithId(bubble.id);
            removeBubble(bubble);
        };
        ereaseChildBubble(bubble);
        // TODO  한 번에 삭제 추가할 수 있도록 할 것
        // removeBubble(bubble);
        commitLog();
    };

    const findIntersectCurves = (curveWithErasers: Array<CurveAndEraser>): Array<CurveAndEraser> => {
        return curveWithErasers.filter(({ curve, eraser }) => {
            const rect = curve2Rect(curve.position);
            if (rect) return isCollisionRectWithCircle(rect, eraser);
            return false;
        });
    };

    const isIntersectCurveWithEraser = (circle: Circle, curve: Curve): boolean => {
        // TODO 두께 고려한 지우기, radius 보정 필요
        const points = curve.position;
        for (let i = 0; i < points.length - 1; i++) {
            if (isCollisionCapsuleWithCircle({ p1: points[i], p2: points[i + 1], radius: circle.radius }, circle)) {
                return true;
            }
        }
        return false;
    };

    /**
     * curve의 control point 변경 => updateCurve
     */
    const markCurveWithEraser = (circle: Circle, curve: Curve): Curve => {
        const { config, position: points } = curve;

        // TODO 두께 고려한 지우기, radius 보정 필요
        const updatedPoints = points.map((point, index) => {
            if (index < points.length - 1) {
                const nextPoint = points[index + 1];
                // 충돌 여부를 확인하고 조건이 맞으면 isVisible을 false로 변경
                if (isCollisionCapsuleWithCircle({ p1: point, p2: nextPoint, radius: 5 }, circle)) {
                    return { ...point, isVisible: false };
                }
            }
            return point; // 조건에 맞지 않으면 기존 point 반환
        });
        return {
            type: 'curve',
            config: config,
            position: updatedPoints,
            id: curve.id,
        };
    };

    return { startErase, erase, endErase, eraseBubble };
};
