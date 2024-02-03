import { webhookQueue } from "../index";
import { WebhookPayload } from "../bullProcesses/webhook.process";
import { Request, Response } from 'express';

export const webhookController = async (req: Request, res: Response) => {
    try {
        const webhookPayload: WebhookPayload = req.body;

        // calculate delay in milliseconds based on the target_time
        let delay = 0;
        if (webhookPayload.target_time) {
            const targetTime = new Date(webhookPayload.target_time);
            const currentTime = new Date();

            // validate target time if it is in the future
            if (targetTime.getTime() <= currentTime.getTime()) {
                return res.status(400).send({
                    error: 'Target time must be in the future',
                });
            }

            delay = targetTime.getTime() - currentTime.getTime();
        }

        // add webhook to the queue with delay
        const queue = await webhookQueue.add(webhookPayload, {
            delay, // add delay in milliseconds
        });

        return res.send(`Webhook added to queue with id: ${queue.id}`);
    } catch (error) {
        return res.status(500).send({
            error: `webhookController error: ${error}`,
        });
    }
};