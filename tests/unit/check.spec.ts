import Jimp from 'jimp';
import { check } from '/@/lib/check';

describe('test', () => {
  test('test', async () => {
    const image = await Jimp.read('tests/fixtures/demo/5-white.png');
    const output = await check(image);

    // expect(output).toEqual(false)
    output.writeAsync('tests/unit/dist/out.png');
  });
});
