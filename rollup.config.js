import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'lib/index.js',
    output: {
      format: 'umd',
      name: 'tuxi',
      file: 'dist/tuxi.min.js',
      globals: { util: 'util', vue: 'Vue' }
    },
    plugins: [resolve(), commonjs(), terser()],
    external: ['vue', 'util']
  },
  {
    input: 'lib/index.js',
    output: {
      format: 'es',
      file: 'dist/tuxi.js',
      globals: { util: 'util', vue: 'Vue' }
    },
    plugins: [resolve(), commonjs()],
    external: ['vue', 'util']
  }
]
