// idea: forward kinematics
/** 좌표 변환 과정(obj의 로컬 좌표 -> view 좌표(canvas에 보이는 좌표))
 * 1. bubble
 *    bubble내의 obj의 로컬 좌표계를 한 단계 올림(bubble과 같은 path, bubble처럼 취급)
 *
 *    functions: bubble2globalWithPoint, curve2bubble
 *
 * 2. hierarchy
 *    canvas view의 path와 bubble의 path가 다를 경우 canvas view의 좌표계로 맞춤
 *    anti-aliasing 필요(ex. 3 depth 이상 차이 나는 경우 undifined)
 *
 *    functions: descendant2child
 *
 * 3. cameraView
 *    cameraView를 통해 실제 canvas에 표시할 수 있는 좌표계 구하기
 *    1, 2과정을 포함함
 *
 *    functions: point2View, curve2View, rect2View
 *
 */

export const point2View = (point: Point, cameraView: ViewCoord): Vector2D => {
    // if (!isCollisionPointWithRect(point, cameraView.pos)) return undefined;
    const { left, top, width, height } = cameraView.pos;
    const { x: canvasWidth, y: canvasHeight } = cameraView.size;
    return {
        x: ((point.x - left) * canvasWidth) / width,
        y: ((point.y - top) * canvasHeight) / height,
    };
};

export const curve2View = (curve: Curve2D, cameraView: ViewCoord): Curve2D => {
    const ret: Curve2D = curve.map((point) => {
        const { left, top, width, height } = cameraView.pos;
        const { x: canvasWidth, y: canvasHeight } = cameraView.size;
        return {
            isVisible: point.isVisible,
            x: ((point.x - left) * canvasWidth) / width,
            y: ((point.y - top) * canvasHeight) / height,
        };
    });
    return ret;
};

export const rect2View = (rect: Rect, cameraView: ViewCoord): Rect => {
    const { left, top, width, height } = cameraView.pos;
    const { x: canvasWidth, y: canvasHeight } = cameraView.size;
    const rectTop = ((rect.top - top) * canvasHeight) / height;
    const rectLeft = ((rect.left - left) * canvasWidth) / width;
    const ret: Rect = {
        top: rectTop,
        left: rectLeft,
        height: ((rect.top + rect.height - top) * canvasHeight) / height - rectTop,
        width: ((rect.left + rect.width - left) * canvasWidth) / width - rectLeft,
    };
    return ret;
};

export const view2Point = (point: Vector2D, cameraView: ViewCoord): Vector2D => {
    const { left, top, width, height } = cameraView.pos;
    const { x: canvasWidth, y: canvasHeight } = cameraView.size;
    return {
        x: (point.x * width) / canvasWidth + left,
        y: (point.y * height) / canvasHeight + top,
    };
};

export const view2Curve = (curve: Curve2D, cameraView: ViewCoord): Curve2D => {
    const ret: Curve2D = curve.map((point) => {
        const { left, top, width, height } = cameraView.pos;
        const { x: canvasWidth, y: canvasHeight } = cameraView.size;
        return {
            isVisible: point.isVisible,
            x: (point.x * width) / canvasWidth + left,
            y: (point.y * height) / canvasHeight + top,
        };
    });
    return ret;
};

export const view2Rect = (rect: Rect, cameraView: ViewCoord): Rect => {
    const { left, top, width, height } = cameraView.pos;
    const { x: canvasWidth, y: canvasHeight } = cameraView.size;
    const rectTop = (rect.top * height) / canvasHeight + top;
    const rectLeft = (rect.left * width) / canvasWidth + left;
    return {
        top: rectTop,
        left: rectLeft,
        height: ((rect.height + rect.top) * height) / canvasHeight + top - rectTop,
        width: ((rect.width + rect.left) * width) / canvasWidth + left - rectLeft,
    };
};

/**
 * point는 bubble 내 좌표계 => point를 bubble의 좌표계 밖으로 뺌
 */
export const bubble2globalWithPoint = (point: Point, bubble: Bubble | undefined): Point => {
    if (bubble == undefined) return point;
    else
        return {
            isVisible: point.isVisible,
            y: (bubble.height * (100 + point.y)) / 200 + bubble.top,
            x: (bubble.width * (100 + point.x)) / 200 + bubble.left,
        };
};

/**
 * curve는 bubble 내 좌표계 => curve를 bubble의 좌표계 밖으로 뺌
 */
export const bubble2globalWithCurve = (curve: Curve2D, bubble: Bubble | undefined): Curve2D => {
    if (bubble == undefined) return curve;
    else
        return curve.map((point) => {
            return {
                isVisible: point.isVisible,
                x: (bubble.width * (100 + point.x)) / 200 + bubble.left,
                y: (bubble.height * (100 + point.y)) / 200 + bubble.top,
            };
        });
};

/**
 * rect은 bubble 내 좌표계 => rect을 bubble의 좌표계 밖으로 뺌
 */
export const bubble2globalWithRect = (rect: Rect, bubble: Bubble | undefined): Rect => {
    if (bubble == undefined) return rect;
    else
        return {
            top: (bubble.height * (100 + rect.top)) / 200 + bubble.top,
            left: (bubble.width * (100 + rect.left)) / 200 + bubble.left,
            height: (bubble.height * rect.height) / 200,
            width: (bubble.width * rect.width) / 200,
        };
};

/**
 * rect과 bubble은 좌표계가 같음 => rect을 bubble의 좌표계 안으로 넣음
 */
export const global2bubbleWithRect = (rect: Rect, bubble: Bubble | Rect | undefined): Rect => {
    if (bubble == undefined) return rect;
    else
        return {
            top: ((rect.top - bubble.top) * 200) / bubble.height - 100,
            left: ((rect.left - bubble.left) * 200) / bubble.width - 100,
            height: (rect.height * 200) / bubble.height,
            width: (rect.width * 200) / bubble.width,
        };
};

/**
 * point과 bubble은 좌표계가 같음 => point을 bubble의 좌표계 안으로 넣음
 */
export const global2bubbleWithVector2D = (point: Vector2D, bubble: Bubble | undefined): Vector2D => {
    if (bubble == undefined) return point;
    else
        return {
            y: ((point.y - bubble.top) * 200) / bubble.height - 100,
            x: ((point.x - bubble.left) * 200) / bubble.width - 100,
        };
};

/**
 * point과 bubble은 좌표계가 같음 => point을 bubble의 좌표계 안으로 넣음
 */
export const global2bubbleWithCurve = (curve: Curve2D, bubble: Bubble | undefined): Curve2D => {
    if (bubble == undefined) return curve;
    else
        return curve.map(({ x, y, isVisible }) => {
            return {
                y: ((y - bubble.top) * 200) / bubble.height - 100,
                x: ((x - bubble.left) * 200) / bubble.width - 100,
                isVisible: isVisible,
            };
        });
};

export const getThicknessRatio = (cameraView: ViewCoord) => {
    return cameraView.size.x / cameraView.pos.width;
};
