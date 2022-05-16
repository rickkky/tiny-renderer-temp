import {
    TinyRenderer,
    loadObjModel,
    renderMesh,
    TgaImage,
} from '../dist/tiny-renderer.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const renderer = new TinyRenderer(canvas.width, canvas.height);

const mesh = await loadObjModel('./model/head.obj');
const texture = await TgaImage.open('./model/head-diffuse.tga');

renderMesh(renderer, mesh, texture.getImageData());

// renderer.triangle([400.3, 400.9], [100, 150], [300, 200], [255, 0, 0, 255]);
// renderer.triangle([400.3, 400.9], [100, 150], [200, 300], [0, 255, 0, 255]);
// renderer.triangle([10, 70], [50, 160], [20, 180], [0, 255, 0, 255]);
// renderer.triangle([180, 150], [120, 160], [130, 180], [0, 0, 255, 255]);

renderer.render(ctx);
