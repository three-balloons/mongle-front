import { PictureRes } from '@/api/pictrues/type';
import { OFF_SCREEN_HEIGHT, OFF_SCREEN_WIDTH } from '@/util/constant';

export const pictureMapper = (pictureRes: PictureRes): Picture => {
    return {
        ...pictureRes,
        type: 'picture',
        offScreen: new OffscreenCanvas(OFF_SCREEN_WIDTH, OFF_SCREEN_HEIGHT),
        image: new Image(),
    };
};
