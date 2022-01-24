import * as path from 'path';
import * as fs from 'fs';
import Jimp from 'jimp';

export const svgToPng = (outDir: string, dest: string) => {
  const files = fs.readdirSync(outDir);
  fs.mkdirSync(dest, { recursive: true });
  files.map(async (filePath) => {
    const absolutePath = outDir + '/' + filePath;
    const image = await Jimp.read(absolutePath);
    image.write(dest + '/' + path.basename(filePath, '.svg') + '.png');
  });
};
let debugOut = '';
export const setDebugOut = (path: string) => (debugOut = path);
export const getDebugOut = () => debugOut;
