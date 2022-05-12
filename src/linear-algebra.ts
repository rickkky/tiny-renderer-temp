export type Vector2 = [number, number];
export type Vector3 = [number, number, number];

export function add<V extends number[]>(v: V, w: V): V {
    return v.map((x, i) => x + w[i]) as V;
}

export function subtract<V extends number[]>(v: V, w: V): V {
    return v.map((x, i) => x - w[i]) as V;
}

export function divide<V extends number[]>(v: V, n: number): V {
    return v.map((x) => x / n) as V;
}

export function multiply<V extends number[]>(v: V, n: number): V {
    return v.map((x) => x * n) as V;
}

export function normalize<V extends number[]>(v: V): V {
    return divide(v, Math.sqrt(v.reduce((sum, x) => sum + x * x, 0)));
}

export function dot<V extends number[]>(v: V, w: V) {
    return v.reduce((sum, x, i) => sum + x * w[i], 0);
}

export function cross(v: Vector3, w: Vector3) {
    return [
        v[1] * w[2] - v[2] * w[1],
        v[2] * w[0] - v[0] * w[2],
        v[0] * w[1] - v[1] * w[0],
    ] as Vector3;
}
