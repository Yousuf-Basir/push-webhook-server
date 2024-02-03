import { Response } from 'express';

export const sampleView = (res: Response) => {
  res.send(`
    <h1>Push notification server</h1>
  `);
};
