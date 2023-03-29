export class Vector extends Array<number> {
    static create(size: number) {
        return new Vector(...new Array(size).fill(0));
    }

    static add(a: Vector, b: Vector) {
        return a.clone().add(b);
    }

    static substract(a: Vector, b: Vector) {
        return a.clone().substract(b);
    }

    static scale(v: Vector, n: number) {
        return v.clone().scale(n);
    }

    static normalize(v: Vector) {
        return v.clone().normalize();
    }

    static dot(a: Vector, b: Vector) {
        return a.dot(b);
    }

    static cross(a: Vector, b: Vector) {
        return a.clone().cross(b);
    }

    constructor(...args: number[]) {
        if (args.length < 2) {
            throw new Error('Vector must have at least 2 dimensions');
        }
        super(...args);
    }

    get dimension() {
        return this.length;
    }

    get size() {
        return Math.sqrt(this.reduce((acc, n) => acc + n * n, 0));
    }

    clone() {
        return new Vector(...this);
    }

    add(v: Vector) {
        for (const i of this.keys()) {
            this[i] += v[i];
        }
        return this;
    }

    substract(v: Vector) {
        for (const i of this.keys()) {
            this[i] -= v[i];
        }
        return this;
    }

    scale(n: number) {
        for (const i of this.keys()) {
            this[i] *= n;
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

    dot(v: Vector) {
        return this.reduce((acc, n, i) => acc + n * v[i], 0);
    }

    cross(v: Vector) {
        if (this.dimension !== 3 || v.dimension !== 3) {
            throw new Error('Cross product is only defined for 3D vectors');
        }
        const [x0, y0, z0] = this;
        const [x1, y1, z1] = v;
        this[0] = y0 * z1 - z0 * y1;
        this[1] = z0 * x1 - x0 * z1;
        this[2] = x0 * y1 - y0 * x1;
        return this;
    }
}
