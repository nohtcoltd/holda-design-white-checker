// import { check } from 'checker';
import * as path from 'path';
import * as util from 'util';
import * as childProcess from 'child_process';
import * as fs from 'fs';
const exec = util.promisify(childProcess.exec);

export const checkFile = async (filePath: string, px: number) => {
  const base = path.dirname(filePath);

  const out = base + '/output.png';
  const p = [__dirname + '/wasm/checker-wasm', filePath, px, out].join(' ');
  await exec(p);
  return fs.readFileSync(out).toString('base64');
};
