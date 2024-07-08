// point
interface Vector2D {
    x: number;
    y: number;
}
interface Vector3D {
    x: number;
    y: number;
    z: number;
}
type Point = Vector2D;

// curve
type Curve2D = Array<Point>;
type Curve3D = Array<Vector3D>;

// TODO: penConfig 추가할 것
type Curve = { position: Curve2D; path: string; config: PenConfig };

// rectangle
interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

// circle
interface Circle {
    center: Point;
    radius: number;
}
