import { Job } from 'bull';
import { NotificationPayload } from '../controllers/push.controller';
import { firebaseCloudMessaging } from '../index';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

export const notificationSenderProcess = async (job: Job) => {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const notificationPayload: NotificationPayload = job.data;
    
            // check if notificationPayload is valid
            if (!notificationPayload || !notificationPayload.title || !notificationPayload.device_token || !notificationPayload.message || !notificationPayload.device_type) {
                throw new Error('Invalid notification payload');
            }
    
            // send notification
            switch (notificationPayload.device_type) {
                case 'ANDROID':
                    let message: Message = {
                        notification: {
                            title: notificationPayload.title,
                            body: notificationPayload.message,
                        },
                        token: notificationPayload.device_token,
                        android: {
                            priority: 'high',
                        },
                    }

                    if(notificationPayload.data) {
                        message.data = notificationPayload.data
                    }

                    console.log("message", message);

                    // send android notification
                    firebaseCloudMessaging.send(message).then((response) => {
                        // resolve bull process if successful
                        job.progress(100);
                        job.moveToCompleted('success', true);
                    }).catch((error) => {
                        console.log(error)
                        // reject bull process if failed
                        job.progress(100);
                        job.moveToFailed(error, true);
                    });
                    break;
                case 'IOS':
                    // send ios notification
                    job.progress(100);
                    job.moveToFailed({
                        message: 'IOS notification not implemented yet',
                    }, true);
                    break;
                default:
                    job.progress(100);
                    job.moveToFailed({
                        message: 'Invalid device type',
                    }, true);
                    break;
            }
    
            resolve();
        } catch (error) {
            console.log(error);
            // reject bull process if failed
            job.progress(100);
            job.moveToFailed({
                message: 'Failed to send notification to FCM. Unknown error',
            }, true);
            reject(error);
        }
    });
}
