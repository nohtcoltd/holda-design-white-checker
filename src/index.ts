import { start } from './start';
import * as fs from 'fs';

const imagePath = process.argv[2];
const outDir = process.argv[3];
const debugOutDir = process.argv[4];
if (!imagePath) {
  throw new Error('引数0 inputがありません');
}

if (!outDir) {
  throw new Error('引数1 outputがありません');
}

if (!fs.existsSync(imagePath)) {
  throw new Error('inputに指定したフォルダがありません');
}

if (!fs.existsSync(outDir)) {
  throw new Error('outputに指定したフォルダがありません');
}

start(imagePath, outDir, debugOutDir);
