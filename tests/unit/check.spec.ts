import Jimp from 'jimp';
import { check } from '/@/lib/check';

describe('test', () => {
  test('test', async () => {
    const output = await check('tests/fixtures/demo/5-white.png');

    // expect(output).toEqual(false)
    output.writeAsync('tests/unit/dist/out.png');
  });
});
