export type Vector = number[];

export type Vector2 = [number, number];

export type Vector3 = [number, number, number];

export type Vector4 = [number, number, number, number];

export type Matrix = number[][];

export type Matrix2 = [Vector2, Vector2];

export type Matrix3 = [Vector3, Vector3, Vector3];

export type Matrix4 = [Vector4, Vector4, Vector4, Vector4];

export function add<V extends Vector>(v: V, w: V): V {
    return v.map((x, i) => x + w[i]) as V;
}

export function subtract<V extends Vector>(v: V, w: V): V {
    return v.map((x, i) => x - w[i]) as V;
}

export function scale<V extends Vector>(v: V, n: number): V {
    return v.map((x) => x * n) as V;
}

export function normalize<V extends Vector>(v: V): V {
    return scale(v, 1 / Math.sqrt(v.reduce((sum, x) => sum + x * x, 0)));
}

export function dot<V extends Vector>(v: V, w: V) {
    return v.reduce((sum, x, i) => sum + x * w[i], 0);
}

export function cross(v: Vector3, w: Vector3) {
    return [
        v[1] * w[2] - v[2] * w[1],
        v[2] * w[0] - v[0] * w[2],
        v[0] * w[1] - v[1] * w[0],
    ] as Vector3;
}

export function multiply<V extends Vector>(m: Matrix, v: V): V {
    if (v.length !== m[0].length) {
        throw new Error('vector length must match matrix width');
    }
    return m.map((row) => dot(row, v)) as V;
}

export function transform<V extends Vector>(m: Matrix, v: V) {
    if (v.length === m[0].length - 1) {
        // transform homogeneous vector
        const w = multiply(m, [...v, 1]);
        return scale(w, 1 / w[w.length - 1]).slice(0, v.length) as V;
    } else {
        return multiply(m, v);
    }
}
