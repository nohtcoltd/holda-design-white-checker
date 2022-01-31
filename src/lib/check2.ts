import Jimp from 'jimp';

export const check2 = async (src: string) => {
  console.time('read');
  const image = await Jimp.read(src)
  console.timeEnd('read');

  console.time('gray');
  await grayScale(image);
  console.timeEnd('gray');

  console.time('edge');
  const edges = getEdges(image);
  console.timeEnd('edge');
  const rad = 5;
  const circle = CircleDrawer.createCircle(rad, 0x00000000, 0xff000035);
  console.time('crop');
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

function grayScale(image: Jimp) {
  return new Promise<Jimp>((resolve) =>
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      if (image.bitmap.data[idx] > 255 * 0.3 || image.bitmap.data[idx + 3] < 255 * 0.3) {
        image.setPixelColor(0, x, y);
      } else {
        image.setPixelColor(255, x, y);
      }
      resolve(image);
    }),
  );
}

const rad = 3;
const black = 255;
const white = 0;

function getEdges(image: Jimp) {
  const list = [] as number[][];

  image.scan(
    rad * 2,
    rad * 2,
    image.bitmap.width - rad * 4,
    image.bitmap.height - rad * 4,
    (x, y, idx) => {
      const it = image.getPixelColor(x, y);
      if (it === black) {
        const left = image.getPixelColor(x - 1, y);
        const right = image.getPixelColor(x + 1, y);
        const top = image.getPixelColor(x, y - 1);
        const bottom = image.getPixelColor(x, y + 1);
        if (left === white || right === white || top === white || bottom === white) {
          list.push([x, y]);
        }
      }
    },
  );
  return list;
}

async function delightEdge(image: Jimp) {
  const list = [] as number[][];

  image.scan(6, 6, image.bitmap.width - 12, image.bitmap.height - 12, (x, y, idx) => {
    const it = image.getPixelColor(x, y);
    if (it === black) {
      const left = image.getPixelColor(x - 1, y);
      const right = image.getPixelColor(x + 1, y);
      const top = image.getPixelColor(x, y - 1);
      const bottom = image.getPixelColor(x, y + 1);
      if (left === white || right === white || top === white || bottom === white) {
        list.push([x, y]);
      }
    }
  });
  list.forEach(([x, y]) => image.setPixelColor(0xff00ffff, x, y));
  // await Promise.all(
  //   list.map(
  //     ([x, y]) =>
  //       new Promise((resolve) => image.setPixelColor(0xff0000ff, x, y, () => resolve(image))),
  //   ),
  // );
  return image;
}
