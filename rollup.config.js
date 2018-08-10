import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'lib/index.js',
  output: [
    {
      file: 'dist/bundle.umd.js',
      name: 'async-task',
      format: 'umd'
    },

    {
      file: 'dist/bundle.es.js',
      format: 'es'
    }
  ],
  plugins: [resolve(), commonjs()],
  external: ['vue']
}
