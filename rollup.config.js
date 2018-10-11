import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default [
  // Browser Build: IIFE + Babel + Minification
  {
    input: 'lib/index.js',
    output: {
      format: 'iife',
      name: 'tuxi',
      file: 'dist/tuxi.min.js',
      sourceMap: true,
      globals: { vue: 'Vue' }
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        plugins: ['@babel/plugin-proposal-object-rest-spread']
      }),
      terser()
    ],
    external: ['vue']
  },

  // NodeJS Build: CJS + babel (object rest spread only available since node v8.3)
  {
    input: 'lib/index.js',
    output: {
      format: 'cjs',
      file: 'dist/index.js',
      globals: { vue: 'Vue' }
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        plugins: ['@babel/plugin-proposal-object-rest-spread']
      })
    ],
    external: ['vue']
  },

  // ES Build
  {
    input: 'lib/index.js',
    output: {
      format: 'es',
      file: 'dist/tuxi.es.js',
      globals: { vue: 'Vue' }
    },
    plugins: [resolve(), commonjs()],
    external: ['vue']
  }
]
