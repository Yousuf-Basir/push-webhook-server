import { Request, Response } from 'express';
import { notificationQueue } from '../index';

export enum DeviceType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
}

interface DataPayload {
  [key: string]: string; // Key-value pairs of data, both keys and values are strings
};


export type NotificationPayload = {
  title: string;
  message: string;
  device_token: string;
  device_type: DeviceType;
  target_time?: Date;
  data?: DataPayload
}

export const pushController = async (req: Request, res: Response) => {
  try {
    const requestBody: NotificationPayload = req.body;

    // Calculate delay in milliseconds based on the target_time
    let delay = 0;

    if (requestBody.target_time) {
      const targetTime = new Date(requestBody.target_time);
      const currentTime = new Date();

      // validate target time if it is in the future
      if (targetTime.getTime() <= currentTime.getTime()) {
          return res.status(400).send({
              error: 'Target time must be in the future',
          });
      }

      delay = targetTime.getTime() - currentTime.getTime();
  }

    // Add notification to the queue with delay
    const queue = await notificationQueue.add(requestBody, {
      delay, // Add delay in milliseconds
    });

    return res.send(`Notification added to queue with id: ${queue.id}`);
  } catch (error) {
    return res.status(500).send({
      error: `pushController error: ${error}`,
    });
  }
};
