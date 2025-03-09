import { arrayBufferToBase64, base64ToArrayBuffer } from '@/util/base64';
import { WORKSPACE_INNER_HALF_SIZE, WORKSPACE_INNER_SIZE } from '@/util/constant';

/**
 * x: 2bytes
 * y: 2bytes
 * isVisible: 1bytes
 * */
export const curveEncoding = (position: Curve2D) => {
    const buffer = new ArrayBuffer(position.length * 5);
    const view = new DataView(buffer);

    position.forEach(({ x, y, isVisible }, index) => {
        const xx = (x + WORKSPACE_INNER_HALF_SIZE) % WORKSPACE_INNER_SIZE;
        const yy = (y + WORKSPACE_INNER_HALF_SIZE) % WORKSPACE_INNER_SIZE;
        view.setUint8(index * 5, Math.floor(xx / 64));
        view.setUint8(index * 5 + 1, Math.floor(xx % 64));
        view.setUint8(index * 5 + 2, Math.floor(yy / 64));
        view.setUint8(index * 5 + 3, Math.floor(yy % 64));
        view.setUint8(index * 5 + 4, isVisible ? 1 : 0);
    });
    const ret = arrayBufferToBase64(buffer);
    return ret;
};

export const curveDecoding = (base64: string): Curve2D => {
    const buffer = base64ToArrayBuffer(base64);

    const dataView = new DataView(buffer);
    const position: Curve2D = [];
    const positionLength = Math.floor(buffer.byteLength / 5);

    for (let i = 0; i < positionLength; i++) {
        const xx = dataView.getUint8(i * 5) * 64 + dataView.getUint8(i * 5 + 1) - WORKSPACE_INNER_HALF_SIZE;
        const yy = dataView.getUint8(i * 5 + 2) * 64 + dataView.getUint8(i * 5 + 3) - WORKSPACE_INNER_HALF_SIZE;

        position.push({
            x: xx,
            y: yy,
            isVisible: dataView.getUint8(i * 5 + 4) == 1 ? true : false,
        });
    }
    return position;
};
