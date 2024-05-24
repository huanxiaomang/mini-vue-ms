import pkg from './package.json' assert {type: 'json'};
// const pkg = require('./package.json');
import ts from '@rollup/plugin-typescript';
// const ts = require('@rollup/plugin-typescript');

// module.exports = {
export default {
    input: "./src/index.ts",
    output: [
        {
            format: "cjs",
            file: pkg.main
        }, {
            format: "es",
            file: pkg.module
        }
    ],
    plugins: [
        ts()
    ]
}