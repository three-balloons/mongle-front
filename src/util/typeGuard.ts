export const isFunction = (value: unknown) => typeof value === 'function';

export const isPoint = (obj: unknown): obj is Point => {
    if (
        obj &&
        typeof (obj as Point).x === 'number' &&
        typeof (obj as Point).y === 'number' &&
        typeof (obj as Point).isVisible === 'boolean'
    )
        return true;
    return false;
};

export const isVector2D = (obj: unknown): obj is Vector2D => {
    if (obj && typeof (obj as Vector2D).x === 'number' && typeof (obj as Vector2D).y === 'number') return true;
    return false;
};

export const isCircle = (obj: unknown): obj is Circle => {
    if (obj && isPoint((obj as Circle).center) && typeof (obj as Circle).radius === 'number') return true;
    return false;
};

export const isRect = (obj: unknown): obj is Rect => {
    if (
        obj &&
        typeof (obj as Rect).left === 'number' &&
        typeof (obj as Rect).top === 'number' &&
        typeof (obj as Rect).width === 'number' &&
        typeof (obj as Rect).height === 'number'
    )
        return true;
    return false;
};

export const isCurve = (obj: unknown): obj is Curve => {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        typeof (obj as Curve).position === 'object' && // Curve2D 타입 확인
        typeof (obj as Curve).config === 'object' && // PenConfig 타입 확인
        (typeof (obj as Curve).id === 'number' || (obj as Curve).id === undefined)
    );
};

export const isBubble = (obj: unknown): obj is Bubble => {
    return (
        isRect(obj) &&
        typeof (obj as Bubble).path === 'string' &&
        typeof (obj as Bubble).name === 'string' &&
        Array.isArray((obj as Bubble).shapes) &&
        (obj as Bubble).shapes.every(isCurve)
    );
};

type ViewCoord = {
    pos: Rect;
    path: string;
    size: Vector2D;
};

export const isCamera = (obj: unknown): obj is ViewCoord => {
    return (
        obj !== null &&
        typeof (obj as ViewCoord).path === 'string' &&
        isRect((obj as ViewCoord).pos) &&
        isVector2D((obj as ViewCoord).size)
    );
};

export const isLogBubble = (log: LogElement): log is LogElement<LogBubble, LogBubble> => {
    return isBubble(log.modified.object as Bubble);
};

export const isLogCurve = (log: LogElement): log is LogElement<LogCurve, LogCurve> => {
    return isCurve(log.modified.object as Curve);
};

export const isLogCamera = (log: LogElement): log is LogElement<LogCamera> => {
    return log.type === 'update' && isCamera(log.modified.object as ViewCoord);
};
