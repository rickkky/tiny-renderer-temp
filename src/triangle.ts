import { cross, Vector2 } from './linear-algebra';

// line sweeping algorithm for triangle
export function sweepLine(
    v0: Vector2,
    v1: Vector2,
    v2: Vector2,
    callback: (v: Vector2) => void,
) {
    // sort vertices by y
    if (v0[1] > v1[1]) {
        [v0, v1] = [v1, v0];
    }
    if (v0[1] > v2[1]) {
        [v0, v2] = [v2, v0];
    }
    if (v1[1] > v2[1]) {
        [v1, v2] = [v2, v1];
    }

    const [x0, y0] = v0;
    const [x1, y1] = v1;
    const [x2, y2] = v2;

    // delta y between vertices
    const dy02 = y2 - y0;
    // plus 1 to prevent divisions by 0
    const dy01 = y1 - y0 + 1;
    const dy12 = y2 - y1 + 1;

    for (let y = y0; y <= y2; y++) {
        let xl = x0 + (x2 - x0) * ((y - y0) / dy02);
        let xr =
            y <= y1
                ? x0 + (x1 - x0) * ((y - y0) / dy01)
                : x1 + (x2 - x1) * ((y - y1) / dy12);
        if (xl > xr) {
            [xl, xr] = [xr, xl];
        }
        for (let x = xl; x <= xr; x += 1) {
            callback([x, y]);
        }
    }
}

// get the barycentric coordinates of `p` in triangle `(v0, v1, v2)`
export function barycentric(v0: Vector2, v1: Vector2, v2: Vector2, p: Vector2) {
    const [x0, y0] = v0;
    const [x1, y1] = v1;
    const [x2, y2] = v2;
    const [x, y] = p;

    // homogeneous coordinate: [u, v, 1]
    const hc = cross([x1 - x0, x2 - x0, x0 - x], [y1 - y0, y2 - y0, y0 - y]);

    // the triangle is degenerate
    if (hc[2] === 0) {
        return [-1, 1, 1];
    }

    const u = hc[0] / hc[2];
    const v = hc[1] / hc[2];

    return [1 - u - v, u, v];
}

// is the point `p` inside the triangle `(v0, v1, v2)`?
export function isInside(v0: Vector2, v1: Vector2, v2: Vector2, p: Vector2) {
    const bc = barycentric(v0, v1, v2, p);
    return bc[0] >= 0 && bc[1] >= 0 && bc[2] >= 0;
}
