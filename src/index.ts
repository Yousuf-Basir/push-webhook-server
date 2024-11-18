import express from 'express';
import path from 'path';
import * as dotenv from 'dotenv';
import sampleRouter from './routes/push.route';
import Bull from 'bull'
import { notificationSenderProcess } from './bullProcesses/notificationSender.process';
import * as admin from 'firebase-admin';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { webhookProcess } from './bullProcesses/webhook.process';
import { callSenderProcess } from './bullProcesses/call.process';
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const serviceAccount = require('./firebase/admin-sdk-key.json');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/bull-ui');

// Redis connection options
let redisOptions:Bull.QueueOptions = {};

// Check if running on the server or local machine
if (process.env.REDIS_ENV === 'cpanel') {
  // Use the socket path for the server
  redisOptions = {
    redis: {
      path: '/home/fastfalcon/tmp/redis.sock'
    }
  };
} else if (process.env.REDIS_ENV === 'quarks') {
  redisOptions = {
    redis: {
      password: process.env.REDIS_PASSWORD,
      host: 'redis-17449.c278.us-east-1-4.ec2.cloud.redislabs.com',
      port: 17449
    }
  }
}

// Create the Bull queue with the appropriate Redis connection options
export const notificationQueue = new Bull('notification', redisOptions);
notificationQueue.process(notificationSenderProcess);

export const webhookQueue = new Bull('webhook', redisOptions);
webhookQueue.process(webhookProcess);

export const callQueue = new Bull('call', redisOptions);
callQueue.process(callSenderProcess);

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(notificationQueue),
    new BullAdapter(webhookQueue),
    new BullAdapter(callQueue)
  ],
  serverAdapter: serverAdapter,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const firebaseCloudMessaging = admin.messaging();

app.get('/', (req, res) => {
  res.send('Welcome to push server v1.0.1');
});

app.use('/push', sampleRouter);

app.use('/bull-ui', serverAdapter.getRouter());

app.listen(port, () => {
  console.log(`Server running on port ${port}. REDIS_ENV: ${process.env.REDIS_ENV}`);
});

export default app;
