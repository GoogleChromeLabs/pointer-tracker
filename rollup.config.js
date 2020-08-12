/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

const esm = {
  plugins: [typescript({ useTsconfigDeclarationDir: false })],
  input: 'lib/index.ts',
  output: {
    file: 'dist/PointerTracker.mjs',
    format: 'esm',
  },
};

const umd = {
  input: 'dist/PointerTracker.mjs',
  output: [
    {
      file: 'dist/PointerTracker.js',
      format: 'umd',
      name: 'PointerTracker',
    },
    {
      plugins: [
        terser({
          compress: { ecma: 6 },
        }),
      ],
      file: 'dist/PointerTracker-min.js',
      format: 'umd',
      name: 'PointerTracker',
    },
  ],
};

export default [esm, umd];
