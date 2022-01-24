import sizeOf from 'image-size';
import Jimp from 'jimp';
import { check } from '/@/lib/check';

const THRESHOLD = 0.3

export class MyImage {
  size: Size;
  path: string;
  private image: Jimp;
  static async init(filePath: string) {
    const _size = sizeOf(filePath);
    const size = { width: _size.width!, height: _size.height! };
    const image = await Jimp.read(filePath);
    return new MyImage(image, size, filePath);
  }
  private constructor(image: Jimp, size: Size, path: string) {
    this.size = size;
    this.image = image;
    this.path = path
  }
  async clip({ left, top, width, height }: Rectangle) {
    const cropped = await this.image.clone().crop(left, top, width, height);
    return cropped.getBase64Async('image/png');
  }

  async check() {
    check(this.image)
  }
}
