import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/tiny-renderer.js',
        format: 'esm',
    },
    plugins: [typescript(), commonjs(), nodeResolve()],
};
