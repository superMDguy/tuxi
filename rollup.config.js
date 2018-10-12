import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import fs from 'fs'
import pascalCase from 'pascalcase'

const builds = [
  // Browser Build: IIFE + Babel + Minification
  {
    input: 'lib/index.js',
    output: {
      format: 'iife',
      name: 'tuxi',
      file: 'dist/tuxi.min.js'
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
    ]
  },

  // NodeJS Build: CJS + babel (object rest spread only available since node v8.3)
  {
    input: 'lib/index.js',
    output: {
      format: 'cjs',
      file: 'dist/index.js'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        plugins: ['@babel/plugin-proposal-object-rest-spread']
      })
    ]
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

fs.readdirSync('./lib/plugins').forEach(pluginFileName => {
  builds.push({
    input: `lib/plugins/${pluginFileName}`,
    output: {
      format: 'umd',
      name: `tuxi${pascalCase(pluginFileName.slice(0, -3))}`,
      file: `dist/plugins/${pluginFileName}`,
      globals: { vue: 'Vue', vuex: 'Vuex' }
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
  })
})
export default builds
