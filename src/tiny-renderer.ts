import type { Vector2, Vector3 } from './linear-algebra';
import { barycentric } from './triangle';

// [r, g, b, a]
type Color = [number, number, number, number];

const BYTES_PER_PIXEL = 4;

export class TinyRenderer {
    #imageData: ImageData;

    #zBuffer: number[] = [];

    constructor(width: number, height: number) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // fill with black
        for (let i = 0; i < data.length; i += 4) {
            data[i + 0] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
        }

        this.#imageData = imageData;
        this.#zBuffer = new Array(width * height).fill(-Infinity);
    }

    get width() {
        return this.#imageData.width;
    }

    get height() {
        return this.#imageData.height;
    }

    setPixel(v: Vector2, color: Color) {
        const x = Math.trunc(v[0]);
        const y = Math.trunc(v[1]);
        const offset = (y * this.width + x) * BYTES_PER_PIXEL;
        for (let i = 0; i < BYTES_PER_PIXEL; i++) {
            this.#imageData.data[offset + i] = color[i];
        }
    }

    /**
     * Using Bresenham’s line drawing algorithm.
     */
    drawLine(v0: Vector2, v1: Vector2, color: Color) {
        let [x0, y0] = v0;
        let [x1, y1] = v1;
        let steep = false;

        if (Math.abs(y1 - y0) > Math.abs(x1 - x0)) {
            steep = true;
            // swap x and y
            [x0, y0, x1, y1] = [y0, x0, y1, x1];
        }

        if (x0 > x1) {
            // swap v0 and v1
            [x0, x1, y0, y1] = [x1, x0, y1, y0];
        }

        const dx = x1 - x0;
        const dy = y1 - y0;
        // step of y: x += 1 => y += sy
        // the original statement is: const sy = Math.abs(dy / dx);
        // for optimization purpose: sy = sy * dx * 2
        const sy = Math.abs(dy) * 2;
        // indicate whether y will change
        let carry = 0;
        let y = y0;

        for (let x = x0; x <= x1; x += 1) {
            // if transposed, de−transpose
            steep ? this.setPixel([y, x], color) : this.setPixel([x, y], color);

            carry += sy;
            // carry > 0.5
            if (carry > dx) {
                y += dy > 0 ? 1 : -1;
                // carry -= 1
                carry -= dx * 2;
            }
        }
    }

    drawTriangle(v0: Vector3, v1: Vector3, v2: Vector3, color: Color) {
        const [x0, y0] = v0;
        const [x1, y1] = v1;
        const [x2, y2] = v2;
        const xmin = Math.trunc(Math.min(x0, x1, x2));
        const xmax = Math.trunc(Math.max(x0, x1, x2));
        const ymin = Math.trunc(Math.min(y0, y1, y2));
        const ymax = Math.trunc(Math.max(y0, y1, y2));

        for (let x = xmin; x <= xmax; x++) {
            for (let y = ymin; y <= ymax; y++) {
                const bc = barycentric(v0, v1, v2, [x, y]);
                const z = v0[2] * bc[0] + v1[2] * bc[1] + v2[2] * bc[2];
                if (
                    bc[0] >= 0 &&
                    bc[1] >= 0 &&
                    bc[2] >= 0 &&
                    z > this.#zBuffer[y * this.width + x]
                ) {
                    this.#zBuffer[y * this.width + x] = z;
                    this.setPixel([x, y], color);
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.putImageData(this.#imageData, 0, 0);
    }
}

export default TinyRenderer;
