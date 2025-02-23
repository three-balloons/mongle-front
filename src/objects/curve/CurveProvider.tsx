import { useBubbleStore } from '@/store/bubbleStore';
import { useConfigStore } from '@/store/configStore';
import { createContext, useEffect, useRef } from 'react';

export type CurveContextProps = {
    getNewCurvePath: () => string;
    setNewCurvePath: (path: string) => void;
    getNewCurve: () => Curve2D;
    setNewCurve: (curve: Curve2D) => void;
    addControlPoint: (pos: Point, force?: boolean) => boolean;
    addNewCurve: (thicknessRatio?: number) => Curve;
    addCurve: (bubbleId: number, curve: Curve) => void;
    updateCurve: (bubbleId: number, curveToUpdate: Curve) => void;
    setSelectedCurve: (curves: Array<Curve>) => void;
    getSelectedCurve: () => Array<Curve>;
    removeCurve: (bubbleId: number, curveToRemove: Curve) => void;
    removeCurvesWithId: (bubbleId: number) => void;
    applyPenConfig: (context: CanvasRenderingContext2D, options?: PenConfig) => void;
    setThicknessWithRatio: (context: CanvasRenderingContext2D, thicknessRatio: number) => void;
};

export const CurveContext = createContext<CurveContextProps | undefined>(undefined);

type CurveProviderProps = {
    children: React.ReactNode;
    sensitivity?: number;
};

export const CurveProvider: React.FC<CurveProviderProps> = ({ children, sensitivity = 0 }) => {
    const newCurveRef = useRef<Curve2D>([]);
    const newCurvePathRef = useRef<string>('/');
    // editor에 의해 선택된 커브를 나타냄
    const selectedCurveRef = useRef<Array<Curve>>([]);
    const coolTime = useRef(sensitivity);
    const penConfig = useConfigStore((state) => state.penConfig);
    const findBubbleByPath = useBubbleStore((state) => state.findBubbleByPath);
    const findBubble = useBubbleStore((state) => state.findBubble);

    // const bufferedUpdateCurveRef = useRef<Map<number, { curve: Curve; path: string }>>(new Map());
    // const bufferedDeleteCurveRef = useRef<Map<number, { curve: Curve; path: string }>>(new Map());
    // const bufferedCreateCurveRef = useRef<Map<number, { curve: Curve; path: string }>>(new Map());
    const nextBufferedCurveIdRef = useRef(-1);
    const penConfigRef = useRef<PenConfig>(penConfig);

    useEffect(() => {
        useConfigStore.subscribe(({ penConfig }) => {
            penConfigRef.current = penConfig;
        });
    }, []);

    const setNewCurvePath = (path: string) => {
        newCurvePathRef.current = path;
    };

    const getNewCurvePath = () => {
        return newCurvePathRef.current;
    };

    const addControlPoint = (pos: Point, force: boolean = false) => {
        if (force || coolTime.current >= sensitivity) {
            newCurveRef.current = [...newCurveRef.current, pos];
            coolTime.current = 0;
            return true;
        } else {
            coolTime.current += 1;
            return false;
        }
    };

    const addNewCurve = (thicknessRatio: number = 1): Curve => {
        const newCurve: Curve = {
            type: 'curve',
            position: newCurveRef.current,
            config: { ...penConfigRef.current, thickness: penConfigRef.current.thickness / thicknessRatio },
            id: nextBufferedCurveIdRef.current,
        };
        const bubble = findBubbleByPath(newCurvePathRef.current);
        // bufferedCreateCurveRef.current.set(newCurve.id, { curve: newCurve, path: newCurvePathRef.current });
        nextBufferedCurveIdRef.current = nextBufferedCurveIdRef.current - 1;
        if (bubble) bubble.shapes = [...bubble.shapes, newCurve];

        newCurveRef.current = [];
        return newCurve;
    };

    const updateCurve = (bubbleId: number, curveToUpdate: Curve) => {
        const bubble = findBubble(bubbleId);
        if (bubble) {
            bubble.shapes = bubble.shapes.map((shape) => {
                if (shape.type === 'curve' && shape.id == curveToUpdate.id) return { ...curveToUpdate };
                else return shape;
            });
        }
    };

    const removeCurve = (bubbleId: number, curveToRemove: Curve) => {
        const bubble = findBubble(bubbleId);
        if (bubble) {
            bubble.shapes = [...bubble.shapes.filter((curve) => curve != curveToRemove)];
        }
    };

    const setSelectedCurve = (curves: Array<Curve>) => {
        selectedCurveRef.current = curves;
    };

    const getSelectedCurve = () => {
        return selectedCurveRef.current;
    };

    const addCurve = (bubbleId: number, curve: Curve) => {
        const bubble = findBubble(bubbleId);
        if (bubble) bubble.shapes = [...bubble.shapes, curve];
    };

    const removeCurvesWithId = (bubbleId: number) => {
        const bubble = findBubble(bubbleId);
        if (bubble) bubble.shapes = [];
    };

    const getNewCurve = (): Curve2D => {
        return [...newCurveRef.current];
    };

    const setNewCurve = (curve: Curve2D) => {
        newCurveRef.current = [...curve];
    };

    const applyPenConfig = (context: CanvasRenderingContext2D, options?: PenConfig) => {
        if (!options) options = penConfigRef.current;
        context.strokeStyle = options.color as string;
        context.fillStyle = options.color as string;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.lineWidth = options.thickness;
    };

    const setThicknessWithRatio = (context: CanvasRenderingContext2D, thicknessRatio: number) => {
        context.lineWidth = context.lineWidth * thicknessRatio;
    };

    return (
        <CurveContext.Provider
            value={{
                getNewCurvePath,
                getNewCurve,
                setNewCurve,
                setNewCurvePath,
                addControlPoint,
                addNewCurve,
                setSelectedCurve,
                getSelectedCurve,
                addCurve,
                updateCurve,
                removeCurve,
                removeCurvesWithId,
                applyPenConfig,
                setThicknessWithRatio,
            }}
        >
            {children}
        </CurveContext.Provider>
    );
};
