import { Job } from 'bull';
import { CallPayload, CallStatus } from '../controllers/call.controller';
import twilio, { Twilio } from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
const twilioClient: Twilio = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const callSenderProcess = async (job: Job) => {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const callPayload: CallPayload = job.data;

      // Validate the payload
      if (!callPayload || !callPayload.to_number) {
        throw new Error('Invalid call payload');
      }

      // Update job progress
      await job.progress(20);

      // Set default values from environment if not provided
      const fromNumber = callPayload.from_number || process.env.TWILIO_FROM_NUMBER;
      const messageUrl = callPayload.message_url || process.env.TWILIO_MESSAGE_URL;

      if (!fromNumber || !messageUrl) {
        throw new Error('Missing required configuration: from_number or message_url');
      }

      // Initiate the call
      const call = await twilioClient.calls.create({
        to: callPayload.to_number,
        from: fromNumber,
        url: messageUrl,
      });

      // Update job progress
      await job.progress(50);

      // Set up call cancellation after specified duration
      setTimeout(async () => {
        try {
          await twilioClient.calls(call.sid).update({ status: 'canceled' });
          console.log(`Call ${call.sid} canceled after ${callPayload.duration} seconds`);
          
          // Update job progress
          await job.progress(100);
          await job.moveToCompleted('Call completed and canceled as scheduled', true);
        } catch (error) {
          console.error('Error canceling call:', error);
          await job.moveToFailed({
            message: `Failed to cancel call: ${error instanceof Error ? error.message : error}`,
          }, true);
        }
      }, (callPayload.duration || 10) * 1000);

      // Log success
      console.log(`Call initiated successfully: SID=${call.sid}`);
      resolve();

    } catch (error) {
      console.error('Call process error:', error);
      
      // Update job progress and status
      await job.progress(100);
      await job.moveToFailed({
        message: `Failed to process call: ${error instanceof Error ? error.message : error}`,
      }, true);
      
      reject(error);
    }
  });
};