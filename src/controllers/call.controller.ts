import { Request, Response } from 'express';
import { callQueue } from '../index';

export enum CallStatus {
  PENDING = 'PENDING',
  INITIATED = 'INITIATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export type CallPayload = {
  to_number: string;
  from_number?: string;  // Optional as it can be pulled from env
  message_url?: string;  // Optional as it can be pulled from env
  target_time?: Date;
  duration?: number;     // Duration in seconds before auto-cancel
  status?: CallStatus;
}

export const callController = async (req: Request, res: Response) => {
  try {
    const requestBody: CallPayload = req.body;

    // Calculate delay in milliseconds based on the target_time
    let delay = 0;

    if (requestBody.target_time) {
      const targetTime = new Date(requestBody.target_time);
      const currentTime = new Date();

      // Validate target time if it is in the future
      if (targetTime.getTime() <= currentTime.getTime()) {
        return res.status(400).send({
          error: 'Target time must be in the future',
        });
      }

      delay = targetTime.getTime() - currentTime.getTime();
    }

    // Validate phone number format
    if (!requestBody.to_number.match(/^\+[1-9]\d{1,14}$/)) {
      return res.status(400).send({
        error: 'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)',
      });
    }

    // Set default duration if not provided
    if (!requestBody.duration) {
      requestBody.duration = 10; // Default 10 seconds
    }

    // Set initial status
    requestBody.status = CallStatus.PENDING;

    // Add call to the queue with delay
    const queue = await callQueue.add(requestBody, {
      delay, // Add delay in milliseconds
    });

    return res.send({
      message: 'Call request queued successfully',
      call_id: queue.id,
      status: CallStatus.PENDING
    });

  } catch (error) {
    console.error('Call controller error:', error);
    return res.status(500).send({
      error: `callController error: ${error instanceof Error ? error.message : error}`,
    });
  }
};