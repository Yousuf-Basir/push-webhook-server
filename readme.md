# Push Server

This is a Node.js server that allows you to send push notifications to your users. It uses the Firebase Cloud Messaging (FCM) API to send notifications to Android and iOS devices.
Also it has a webhook feature to call a api url at a specific time with a specific payload.

## Installation

1. Clone the repository: `git clone https://github.com/Yousuf-Basir/push-server`
2. Install dependencies: `npm install`
3. Create a Firebase project and get your server key from the Firebase console.

## Usage

To start the server, run `npm run dev`. The server will listen on port 3000 by default.

### Sending a notification

To send a notification, make a POST request to `/push/send` with the following JSON payload:

```ts
{
    "title": "Hello test notification",
    "message": "This is from push server",
    "device_token": "eX_7Zub7SZCdM6da62MPg4:APA91bFtOvWhupH1xlYeJ2VyPwT_...._DWe-UHaiNUzXU2V0PYVa0cG",
    "device_type": "ANDROID",
    "target_time": "2024-02-03T09:06:53.038Z"
}
```

### Creating a webhook
To create a webhook, make a POST request to  with the following JSON payload:

```ts
{
    "url": "http://someserver.com/api/do-something",
    "payload": {
        "title": "Test webhook",
        "message": "Hello my webhook",
        "token": "eX_7Zub7SZCdM6da62MPg4:APA91bFtOvWhupH1xlYeJ2VyPwT_...._DWe-UHaiNUzXU2V0PYVa0cG"
    },
    "target_time": "2021-08-25T12:00:00.000Z",
    "time_zone": "Asia/Dhaka"
}
``` 

The `target_time` and `time_zone` fields are optional. If they are not provided, the notification will be sent immediately.

### Bull UI Dashboard

The server uses [Bull](https://optimalbits.github.io/bull/) for queueing notifications. You can access the Bull UI dashboard at 

`http://localhost:3000/bull-ui`

