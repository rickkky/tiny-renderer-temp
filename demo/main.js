import { TinyRenderer, loadObjModel } from './tiny-renderer.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const renderer = new TinyRenderer(canvas.width, canvas.height);

const mesh = await loadObjModel('./model.obj');
await renderer.drawMesh(mesh, [0, 0, 0, 255]);

renderer.render(ctx);
