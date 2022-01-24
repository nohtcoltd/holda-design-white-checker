import * as fs from 'fs';
import { base64ToBuffer } from './base64ToBuffer';

export const saveAsPng = (path: string, item: paper.Item) => {
  const raster = item.rasterize();
  const dataUrl = raster.toDataURL();
  const buffer = base64ToBuffer(dataUrl);
  fs.writeFileSync(path, buffer);
};
