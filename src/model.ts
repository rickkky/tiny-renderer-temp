import { Mesh } from 'webgl-obj-loader';
import type { TinyRenderer } from './tiny-renderer';
import {
    cross,
    dot,
    normalize,
    subtract,
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
    const scale = (v: Vector3) => {
        // x, y are normalized coordinates between [-1,1]
        const [x, y, z] = v;
        // scale the x and y to the canvas size
        return [
            ((x + 1) / 2) * renderer.width,
            ((y + 1) / 2) * renderer.height,
            z,
        ] as Vector3;
    };
    const getTexture = (index: number) => {
        const u = mesh.textures[index + 0];
        const v = mesh.textures[index + 1];
        return [u, v] as Vector2;
    };

    const light: Vector3 = [0, 0, -1];

    for (let i = 0; i < mesh.indices.length; i += 3) {
        const wc0 = getVertex(mesh.indices[i + 0] * 3);
        const wc1 = getVertex(mesh.indices[i + 1] * 3);
        const wc2 = getVertex(mesh.indices[i + 2] * 3);
        const sc0 = scale(wc0);
        const sc1 = scale(wc1);
        const sc2 = scale(wc2);
        const t0 = getTexture(mesh.indices[i + 0] * 2);
        const t1 = getTexture(mesh.indices[i + 1] * 2);
        const t2 = getTexture(mesh.indices[i + 2] * 2);
        const n = normalize(cross(subtract(wc2, wc0), subtract(wc1, wc0)));
        const intensity = dot(n, light);
        if (intensity > 0) {
            renderer.triangle(sc0, sc1, sc2, t0, t1, t2, intensity, texture);
        }
    }
}
