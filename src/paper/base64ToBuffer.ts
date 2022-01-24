export const bufferToBase64 = (buffer: Buffer) => {
  return `data:image/png;base64,${buffer.toString('base64')}`;
};

export const base64ToBuffer = (dataUrl: string) => {
  if (typeof dataUrl === 'string') {
    const str = dataUrl.replace(/^data:\w+\/\w+;base64,/, '');
    return Buffer.from(str, 'base64');
  } else {
    return dataUrl as Buffer;
  }
};