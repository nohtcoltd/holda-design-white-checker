import { UnitLength } from '/@/lib/UnitLength';
import { start } from '/@/start';
import * as fs from 'fs'

describe('機能テスト', () => {
  test('start', () => {
    start(
      'tests/fixtures/demo/cut.svg',
      ['tests/fixtures/demo/color.png', 'tests/fixtures/demo/white.png'],
      'tests/out',
      new UnitLength('733.99423mm'),
      new UnitLength('297.00008mm'),
    );
    const files = fs.readdirSync('tests/out')
    files.forEach((file)=>{
      expect(fs.readFileSync('tests/out/' + file).toString()).toEqual(fs.readFileSync('tests/fixtures/demo-out/' + file).toString())
    })
  });
});
