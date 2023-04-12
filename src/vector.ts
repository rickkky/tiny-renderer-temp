export abstract class Vector {
    protected array: number[] = [];

    constructor(...args: number[]) {
        if (args.length < 2) {
            throw new Error('Vector must have at least 2 dimensions');
        }
        this.array[0] = args[0] || 0;
        this.array[1] = args[1] || 0;
    }

    get dimension() {
        return this.array.length;
    }

    get size() {
        return Math.hypot(...this.array);
    }

    get 0() {
        return this.array[0];
    }

    set 0(n: number) {
        this.array[0] = n;
    }

    get x() {
        return this[0];
    }

    set x(n: number) {
        this[0] = n;
    }

    get 1() {
        return this.array[1];
    }

    set 1(n: number) {
        this.array[1] = n;
    }

    get y() {
        return this[1];
    }

    set y(n: number) {
        this[1] = n;
    }

    [Symbol.iterator]() {
        return this.array[Symbol.iterator]();
    }

    abstract clone(): Vector;

    add(v: typeof this) {
        for (const i of this.array.keys()) {
            this.array[i] += v.array[i];
        }
        return this;
    }

    substract(v: typeof this) {
        for (const i of this.array.keys()) {
            this.array[i] -= v.array[i];
        }
        return this;
    }

    scale(n: number) {
        for (const i of this.array.keys()) {
            this.array[i] *= n;
        }
        return this;
    }

    normalize() {
        const size = this.size;
        if (size === 0) {
            throw new Error('Cannot normalize a zero vector');
        }
        return this.scale(1 / size);
    }

    dot(v: typeof this) {
        return this.array.reduce((acc, n, i) => acc + n * v.array[i], 0);
    }
}

export class Vector2 extends Vector {
    clone() {
        return new Vector2(this.x, this.y);
    }
}

export class Vector3 extends Vector {
    constructor(...args: number[]) {
        super(...args);
        this.array[2] = args[2] || 0;
    }

    protected Constructor() {
        return Vector3;
    }

    get 2() {
        return this.array[2];
    }

    set 2(n: number) {
        this.array[2] = n;
    }

    get z() {
        return this[2];
    }

    set z(n: number) {
        this[2] = n;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    cross(v: Vector3) {
        const [x0, y0, z0] = this;
        const [x1, y1, z1] = v;
        this[0] = y0 * z1 - z0 * y1;
        this[1] = z0 * x1 - x0 * z1;
        this[2] = x0 * y1 - y0 * x1;
        return this;
    }
}

export class Vector4 extends Vector3 {
    constructor(...args: number[]) {
        super(...args);
        this.array[3] = args[3] || 0;
    }

    get 3() {
        return this.array[3];
    }

    set 3(n: number) {
        this.array[3] = n;
    }

    get w() {
        return this[3];
    }

    set w(n: number) {
        this[3] = n;
    }

    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }
}
