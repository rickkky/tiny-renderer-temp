import { Mesh } from 'webgl-obj-loader';

// [r, g, b, a]
type Color = [number, number, number, number];

const BYTES_PER_PIXEL = 4;

export class TinyRenderer {
    #imageData: ImageData;

    constructor(width: number, height: number) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        data.fill(255);

        this.#imageData = imageData;
    }

    get width() {
        return this.#imageData.width;
    }

    get height() {
        return this.#imageData.height;
    }

    setPixel(x: number, y: number, color: Color) {
        const offset =
            (Math.trunc(y) * this.width + Math.trunc(x)) * BYTES_PER_PIXEL;
        for (let i = 0; i < BYTES_PER_PIXEL; i++) {
            this.#imageData.data[offset + i] = color[i];
        }
    }

    /**
     * Using Bresenham’s line drawing algorithm.
     */
    drawLine(x0: number, y0: number, x1: number, y1: number, color: Color) {
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
            steep ? this.setPixel(y, x, color) : this.setPixel(x, y, color);

            carry += sy;
            // carry > 0.5
            if (carry > dx) {
                y += dy > 0 ? 1 : -1;
                // carry -= 1
                carry -= dx * 2;
            }
        }
    }

    drawMesh(mesh: Mesh, color: Color) {
        const scale = (index: number) => {
            const p: number[] = [];
            // x, y are normalized coordinates between [-1,1]
            let x = mesh.vertices[index + 0];
            let y = mesh.vertices[index + 1];
            // scale the x and y to the canvas size
            p[0] = ((x + 1) / 2) * this.width;
            p[1] = ((y + 1) / 2) * this.height;
            return p;
        };

        for (let i = 0; i < mesh.indices.length; i += 3) {
            const p0 = scale(mesh.indices[i + 0] * 3);
            const p1 = scale(mesh.indices[i + 1] * 3);
            const p2 = scale(mesh.indices[i + 2] * 3);
            this.drawLine(p0[0], p0[1], p1[0], p1[1], color);
            this.drawLine(p1[0], p1[1], p2[0], p2[1], color);
            this.drawLine(p2[0], p2[1], p0[0], p0[1], color);
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.putImageData(this.#imageData, 0, 0);
    }
}

export default TinyRenderer;
