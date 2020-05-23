import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'src/index.cjs',
            format: 'cjs'
        },
        {
            file: 'src/index.esm',
            format: 'esm'
        }
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
            presets: [['@babel/preset-env', {targets: {node: 10}}]]
        }),
        json()
    ]
}
