#!/usr/bin/env node
// import * as estrella from 'estrella'
const { build, ts, glob, log } = require('estrella');
const { TsconfigPathsPlugin } = require('@esbuild-plugins/tsconfig-paths');

build({
  entry: './src/index.ts',
  minify: false,
  bundle: true,
  watch: false,
  format: 'cjs',
  target: 'esnext',
  sourcemap: true,
  platform: 'node',
  outfile: './dist/index.cjs',
  external: ['fs', 'image-size', 'canvas', 'path', 'paper-jsdom', 'jsdom'],
  plugins: [TsconfigPathsPlugin({ tsconfig: './tsconfig.json' })],
  // onEnd(config) {
  //   const dtsFilesOutdir = './dist';
  //   generateTypeDefs('./tsconfig.json', config.entry, dtsFilesOutdir);
  // },
  // outfile: "out/main.js",
  // run: [
  //   'node',
  //   './dist/index.cjs',
  //   './tests/fixtures/matsuken',
  //   './out',
  //   '411.455',
  //   '425.478',
  //   './debugOut',
  // ],
});
