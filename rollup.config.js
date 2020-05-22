import babel from 'rollup-plugin-babel';

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
            presets: [['@babel/preset-env', {targets: {node: 8}}]]
        })
    ],
    external: ['path', 'read-pkg', 'write-pkg']
}
