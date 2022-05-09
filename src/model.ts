import { Mesh } from 'webgl-obj-loader';

export async function loadObjModel(path: string) {
    const response = await fetch(path);
    const text = await response.text();
    return new Mesh(text);
}
