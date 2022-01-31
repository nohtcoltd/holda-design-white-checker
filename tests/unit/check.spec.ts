import Jimp from 'jimp';
import { check } from '/@/lib/check';
import photon from '@silvia-odwyer/photon-node';
import * as fs from 'fs';
import { base64ToBuffer } from '/@/paper/base64ToBuffer';
import { check2 } from '/@/lib/check2';

describe('test', () => {
  test('read', async () => {
    const src = 'tests/fixtures/demo/5-white.png';
    console.time('jimp');
    const image = await Jimp.read(src);
    console.timeEnd('jimp');
    console.time('photon');
    const p = photon.PhotonImage.new_from_byteslice(fs.readFileSync(src));
    const jimp = new Jimp({ width: p.get_width(), height: p.get_height(), data: p.get_raw_pixels() });
    fs.writeFileSync(
      'tests/unit/dist/out.png',
      base64ToBuffer(
        new photon.PhotonImage(
          jimp.bitmap.data,
          jimp.bitmap.width,
          jimp.bitmap.height,
        ).get_base64(),
      ),
    );
    console.timeEnd('photon');
  });
  test('test', async () => {
    console.time('hoge');
    const output = await check('tests/fixtures/demo/resize_white.png');
    console.timeEnd('hoge');

    // expect(output).toEqual(false)
    console.time('write');

    fs.writeFileSync(
      'tests/unit/dist/out.png',
      base64ToBuffer(
        new photon.PhotonImage(
          output.bitmap.data,
          output.bitmap.width,
          output.bitmap.height,
        ).get_base64(),
      ),
    );

    // output.writeAsync('tests/unit/dist/out.png');
    console.timeEnd('write');
  });
});
