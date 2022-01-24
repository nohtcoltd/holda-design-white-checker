import paper from 'paper-jsdom';
import { createCanvas } from 'canvas';
export const usePaper = () => {
  paper.setup(createCanvas(500, 500) as any);
};
