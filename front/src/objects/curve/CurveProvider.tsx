import { useConfigStore } from '@/store/configStore';
import { createContext, useEffect, useRef } from 'react';

export type CurveContextProps = {
    // TODO viewPath, setViewPath, viewPathRef 제거하고 curve에서 path 받기
    getNewCurvePath: () => string;
    setNewCurvePath: (path: string) => void;
    getCurves: () => Array<Curve>;
    getCurvesWithPath: (path: string) => Array<Curve>;
    clearAllCurves: () => void;
    getDrawingCurve: () => Curve2D;
    addControlPoint: (pos: Point, force?: boolean) => boolean;
    addNewCurve: (thicknessRatio?: number) => void;
    addCurve: (curve: Curve) => void;
    removeCurve: (curve: Curve) => void;
    removeCurvesWithPath: (path: string) => void;
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
    const curvesRef = useRef<Curve[]>([]);
    const coolTime = useRef(sensitivity);
    const { penConfig } = useConfigStore((state) => state);

    const penConfigRef = useRef<PenConfig>(penConfig);

    useEffect(() => {
        useConfigStore.subscribe(({ penConfig }) => {
            penConfigRef.current = penConfig;
        });
    }, []);

    const clearAllCurves = () => {
        curvesRef.current = [];
        newCurveRef.current = [];
    };

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

    const addNewCurve = (thicknessRatio: number = 1) => {
        curvesRef.current = [
            ...curvesRef.current,
            {
                position: newCurveRef.current,
                path: newCurvePathRef.current,

                config: { ...penConfigRef.current, thickness: penConfigRef.current.thickness / thicknessRatio },
                isVisible: true,
            },
        ];
        newCurveRef.current = [];
    };

    const addCurve = (curve: Curve) => {
        curvesRef.current = [...curvesRef.current, curve];
    };

    const removeCurve = (curveToRemove: Curve) => {
        curvesRef.current = [...curvesRef.current.filter((curve) => curve !== curveToRemove)];
    };

    const removeCurvesWithPath = (path: string) => {
        curvesRef.current = [...curvesRef.current.filter((curve) => curve.path !== path)];
    };

    const getCurvesWithPath = (path: string) => {
        return curvesRef.current.filter((curve) => curve.path == path);
    };

    const getDrawingCurve = (): Curve2D => {
        return [...newCurveRef.current];
    };

    const getCurves = (): Curve[] => {
        return [
            ...curvesRef.current,
            {
                position: newCurveRef.current,
                path: newCurvePathRef.current,
                config: penConfigRef.current,
                isVisible: true,
            },
        ];
    };

    const applyPenConfig = (context: CanvasRenderingContext2D, options?: PenConfig) => {
        if (!options) options = penConfigRef.current;
        context.strokeStyle = options.color as string;
        context.fillStyle = options.color as string;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.lineWidth = options.thickness;
        context.globalAlpha = options.alpha;
    };

    const setThicknessWithRatio = (context: CanvasRenderingContext2D, thicknessRatio: number) => {
        context.lineWidth = context.lineWidth * thicknessRatio;
    };

    return (
        <CurveContext.Provider
            value={{
                getNewCurvePath,
                clearAllCurves,
                getCurves,
                getCurvesWithPath,
                getDrawingCurve,
                setNewCurvePath,
                addControlPoint,
                addNewCurve,
                addCurve,
                removeCurve,
                removeCurvesWithPath,
                applyPenConfig,
                setThicknessWithRatio,
            }}
        >
            {children}
        </CurveContext.Provider>
    );
};
