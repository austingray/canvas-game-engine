import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export default {
  input: 'src/game.js',
  output: {
    file: 'build/game.bundle.js',
    format: 'umd',
    name: 'game',
  },
  plugins: [
    resolve(),
    commonjs(),
    builtins(),
    globals(),
  ]
};
