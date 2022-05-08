import TinyRenderer from '../dist/tiny-renderer.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const renderer = new TinyRenderer(canvas.width, canvas.height);

renderer.drawLine(13, 20, 80, 40, [0, 0, 0, 1]);
renderer.render(ctx);
