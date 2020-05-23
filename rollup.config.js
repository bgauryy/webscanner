import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default {
    input: 'src/index.js',
    external: Object.keys(pkg.dependencies),
    plugins: [
        commonjs(),
        resolve(),
        json(),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**'
        })
    ],
    output: [
        {
            file: pkg.module,
            format: 'es'
        },
        {
            file: pkg.main,
            format: 'cjs'
        }
    ]
};
