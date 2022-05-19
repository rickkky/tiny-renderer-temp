import { Vector2, Vector4 } from './linear-algebra';

// [r, g, b, a]
export type Color = Vector4;

export const BYTES_PER_PIXEL = 4;

export function getPixel(image: ImageData, v: Vector2): Color {
    const x = Math.trunc(v[0]);
    const y = Math.trunc(v[1]);
    const i = (y * image.width + x) * BYTES_PER_PIXEL;
    return [
        image.data[i],
        image.data[i + 1],
        image.data[i + 2],
        image.data[i + 3],
    ];
}
