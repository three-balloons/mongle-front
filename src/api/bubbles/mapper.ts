import { ShapeRes } from '@/api/bubbles/type';
import { curveDecoding } from '@/api/curves/mapper';
import { OFF_SCREEN_HEIGHT, OFF_SCREEN_WIDTH } from '@/util/constant';

export const shapeMapper = (shape: ShapeRes): Shape => {
    if (shape.type === 'curve') {
        return {
            type: 'curve',
            position: curveDecoding(shape.position),
            config: shape.config,
            id: shape.id,
        };
    } else if (shape.type === 'picture') {
        return {
            ...shape,
            type: 'picture',
            offScreen: new OffscreenCanvas(OFF_SCREEN_WIDTH, OFF_SCREEN_HEIGHT),
            image: new Image(),
        };
    } else {
        return {
            ...shape,
            type: 'pdf',
            offScreen: new OffscreenCanvas(OFF_SCREEN_WIDTH, OFF_SCREEN_HEIGHT),
            image: new Image(),
        };
    }
};
