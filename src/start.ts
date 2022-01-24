import * as path from 'path';
import * as fs from 'fs';
import { MyImage } from './lib/MyImage';
import { setDebugOut } from '/@/debug/svgToPng';

const initDir = (path: string) => {
  fs.existsSync(path) && fs.rmSync(path, { recursive: true, force: true });
  fs.mkdirSync(path);
};
export const start = async (pngPath: string, outDir: string, debugOutDir?: string) => {
  initDir(outDir);
  if (debugOutDir) {
    initDir(debugOutDir);
    setDebugOut(debugOutDir);
  }
  const image = await MyImage.init(pngPath);
  image.check()
};

const saveImage = (image: string, path: string) => {
  fs.writeFileSync(path, image);
};
