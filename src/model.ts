import { Mesh } from 'webgl-obj-loader';
import type { TinyRenderer } from './tiny-renderer';
import {
    cross,
    dot,
    Matrix4,
    normalize,
    subtract,
    transform,
    Vector2,
    Vector3,
} from './linear-algebra';

export async function loadObjModel(path: string) {
    const response = await fetch(path);
    const text = await response.text();
    return new Mesh(text);
}

export function renderMesh(
    renderer: TinyRenderer,
    mesh: Mesh,
    texture: ImageData,
) {
    const getVertex = (index: number) => {
        const x = mesh.vertices[index + 0];
        const y = mesh.vertices[index + 1];
        const z = mesh.vertices[index + 2];
        return [x, y, z] as Vector3;
    };

    const getTexture = (index: number) => {
        const u = mesh.textures[index + 0];
        const v = mesh.textures[index + 1];
        return [u, v] as Vector2;
    };

    const light: Vector3 = [0, 0, -1];

    const projection: Matrix4 = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, -1 / 3, 1],
    ];
    // x, y are normalized coordinates between [-1, 1]
    // scale the x and y to the canvas size
    const viewport: Matrix4 = [
        [renderer.width / 2, 0, 0, renderer.width / 2],
        [0, renderer.height / 2, 0, renderer.height / 2],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];

    for (let i = 0; i < mesh.indices.length; i += 3) {
        const wc0 = getVertex(mesh.indices[i + 0] * 3);
        const wc1 = getVertex(mesh.indices[i + 1] * 3);
        const wc2 = getVertex(mesh.indices[i + 2] * 3);

        const n = normalize(cross(subtract(wc2, wc0), subtract(wc1, wc0)));

        const intensity = dot(n, light);

        if (intensity > 0) {
            const sc0 = transform(viewport, transform(projection, wc0));
            const sc1 = transform(viewport, transform(projection, wc1));
            const sc2 = transform(viewport, transform(projection, wc2));

            const t0 = getTexture(mesh.indices[i + 0] * 2);
            const t1 = getTexture(mesh.indices[i + 1] * 2);
            const t2 = getTexture(mesh.indices[i + 2] * 2);
            console.log(transform(projection, wc0), wc0);
            renderer.triangle(sc0, sc1, sc2, t0, t1, t2, intensity, texture);
        }
    }
}
