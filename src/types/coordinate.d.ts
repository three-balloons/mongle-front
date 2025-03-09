// Coordinate systems

/**
 * (canvas) View coordinate system
 * @field path canvas path
 * @field pos relative position
 * @field size canvas size in screen
 */
type ViewCoord = {
    pos: Rect;
    path: string;
    size: Vector2D;
};

/**
 * Poloar coordinate system
 * @field angle: [0, 360), radius: [0, WORKSPACE_INNER_SIZE) except for root
 */
type PolarCoord = {
    path: string;
    radius: number;
    angle: number;
};

/**
 * Cartesian coordinate system
 * @field x: [-WORKSPACE_INNER_HALF_SIZE, WORKSPACE_INNER_HALF_SIZE), y: [-WORKSPACE_INNER_HALF_SIZE, WORKSPACE_INNER_HALF_SIZE) except for root
 */
type RectCoord = {
    path: string;
    x: number;
    y: number;
};
