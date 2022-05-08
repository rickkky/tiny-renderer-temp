type Color = [number, number, number, number];

// (r, g, b, a)
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

    drawLine(x0: number, y0: number, x1: number, y1: number, color: Color) {
        const deltaX = x1 - x0;
        const deltaY = y1 - y0;

        for (let t = 0; t < 1; t += 0.01) {
            let x = x0 + t * deltaX;
            let y = y0 + t * deltaY;
            this.setPixel(x, y, color);
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.putImageData(this.#imageData, 0, 0);
    }
}

export default TinyRenderer;
