import Jimp from 'jimp';
import photon from '/@/photon/crate/pkg/photon_rs';
import * as fs from 'fs';

const read = (src: string) => photon.PhotonImage.new_from_byteslice(fs.readFileSync(src));

const toJimp = (p: photon.PhotonImage) =>
  new Jimp({ width: p.get_width(), height: p.get_height(), data: p.get_raw_pixels() });

export const check = async (src: string) => {
  const p = read(src);
  photon.binarize(p, 0.3);
  const edges = getEdges2(p);
  const image = toJimp(p);
  const rad = 5;
  const circle = CircleDrawer.createCircle(rad, 0x00000000, 0xff000035);
  edges.map(([x, y]) => {
    const cropped = crop(image, x - rad, y - rad, rad * 2, rad * 2);

    const composited = cropped.composite(circle, 0, 0);
    const v = checkHasRiver(composited);
    if (v) {
      const offsetX = x - rad;
      const offsetY = y - rad;
      composited.scan(0, 0, composited.bitmap.width, composited.bitmap.height, (x, y, idx) => {
        if (composited.getPixelColor(x, y) === 255)
          image.setPixelColor(0xff0000ff, x + offsetX, y + offsetY);
      });
    }
  });

  return new Jimp(image.bitmap.width, image.bitmap.height, 0xffffffff).composite(image, 0, 0);
};

const fillSomeAlpha = (image: Jimp) => {
  let filled = false;
  const point: number[] = [];
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    if (image.bitmap.data[idx + 3] === 0 && !filled) {
      point.push(x, y);
      filled = true;
    }
  });
  if (point.length > 1) {
    const [x, y] = point;
    fill(image, x, y, 0x0000ffff);
  }
  return image;
};

const checkHasRiver = (image: Jimp) => {
  const clone = image.clone();
  fillSomeAlpha(clone);
  return hasTransparent(clone) ? clone : false;
};

const fill = (image: Jimp, x: number, y: number, color: number) => {
  const thisColor = image.getPixelColor(x, y);
  image.setPixelColor(color, x, y);
  const topLeft = () => image.getPixelColor(x - 1, y - 1);
  const left = () => image.getPixelColor(x - 1, y);
  const bottomLeft = () => image.getPixelColor(x - 1, y + 1);
  const topRight = () => image.getPixelColor(x + 1, y - 1);
  const right = () => image.getPixelColor(x + 1, y);
  const bottomRight = () => image.getPixelColor(x + 1, y + 1);
  const top = () => image.getPixelColor(x, y - 1);
  const bottom = () => image.getPixelColor(x, y + 1);

  topLeft() == thisColor && fill(image, x - 1, y - 1, color);
  left() === thisColor && fill(image, x - 1, y, color);
  bottomLeft() == thisColor && fill(image, x - 1, y + 1, color);
  topRight() == thisColor && fill(image, x + 1, y - 1, color);
  right() === thisColor && fill(image, x + 1, y, color);
  bottomRight() == thisColor && fill(image, x + 1, y + 1, color);
  top() === thisColor && fill(image, x, y - 1, color);
  bottom() === thisColor && fill(image, x, y + 1, color);
};

const hasTransparent = (image: Jimp) => {
  for (const scan of image.scanIterator(0, 0, image.bitmap.width, image.bitmap.height)) {
    if (image.bitmap.data[scan.idx + 3] === 0) {
      return true;
    }
  }
  return false;
};

const crop = (image: Jimp, x: number, y: number, width: number, height: number) => {
  const array: number[] = [];
  image.scan(x, y, width, height, (_, __, idx) => {
    array.push(
      image.bitmap.data[idx],
      image.bitmap.data[idx + 1],
      image.bitmap.data[idx + 2],
      image.bitmap.data[idx + 3],
    );
  });
  return new Jimp({
    data: Buffer.from(array),
    width,
    height,
  });
};
class CircleDrawer {
  list: number[][];
  constructor(rad: number) {
    this.list = CircleDrawer.getCircle(rad);
  }
  check(image: Jimp, x: number, y: number) {}
  draw(image: Jimp, x: number, y: number, color: number) {
    this.list.forEach(([i, j]) => {
      image.setPixelColor(color, x + i, y + j);
    });
  }
  static getCircle(rad: number) {
    const list: number[][] = [];
    for (let x = -rad; x < rad; x += 1) {
      for (let y = -rad; y < rad; y += 1) {
        if (x * x + y * y <= rad * rad) {
          list.push([x, y]);
        }
      }
    }
    return list;
  }
  static createCircle(rad: number, color: number, bg: number) {
    const list = this.getCircle(rad);
    const image = new Jimp(rad * 2, rad * 2, bg);
    list.forEach(([x, y]) => image.setPixelColor(color, x + rad, y + rad));
    return image;
  }
}

function getEdges2(image: photon.PhotonImage) {
  const width = image.get_width();
  const list = [...photon.get_edges(image).values()];
  return list
    .map((m) => m / 4)
    .map<number[]>((m) => {
      return [m % width, Math.floor(m / width)];
    });
}

function delightEdge2(image: photon.PhotonImage) {
  photon.delight_edges(image);
  return image;
}
