import { Job } from "bull";
import axios from "axios";

export type WebhookPayload = {
    url: string;
    payload: any;
    target_time? : Date;
}

export const webhookProcess = async (job: Job) => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const webhookPayload: WebhookPayload = job.data;

            // check if webhookPayload is valid
            if (!webhookPayload || !webhookPayload.url || !webhookPayload.payload) {
                throw new Error('Invalid webhook payload');
            }

            // trigger webhook
            // POST request to webhook url with payload
            axios.post(webhookPayload.url, webhookPayload.payload).then((response) => {
                // resolve bull process if successful
                job.progress(100);
                job.moveToCompleted('success', true);
            }).catch((error) => {
                console.log(error)
                // reject bull process if failed
                job.progress(100);
                job.moveToFailed(error, true);
            });

            resolve();
        } catch (error) {
            console.log(error);
            // reject bull process if failed
            job.progress(100);
            job.moveToFailed({
                message: 'Failed to send webhook. Unknown error',
            }, true);
            reject(error);
        }
    });
}