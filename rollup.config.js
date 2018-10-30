import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";

const esm = {
  plugins: [ typescript({ useTsconfigDeclarationDir: false }) ],
  input: 'lib/index.ts',
  output: {
    file: 'dist/PointerTracker.mjs',
    format: 'esm'
  },
};

const iffe = {
  input: 'dist/PointerTracker.mjs',
  output: {
    file: 'dist/PointerTracker.js',
    format: 'iife',
    name: 'PointerTracker'
  },
};

const iffeMin = {
  input: 'dist/PointerTracker.mjs',
  plugins: [
    terser({
      compress: { ecma: 6 },
    })
  ],
  output: {
    file: 'dist/PointerTracker-min.js',
    format: 'iife',
    name: 'PointerTracker'
  },
};

export default [esm, iffe, iffeMin];
