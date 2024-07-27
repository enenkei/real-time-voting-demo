import PusherServer from 'pusher';
import Pusher from 'pusher';
import PusherClient from 'pusher-js';
import 'dotenv/config';

// export const pusherServer = new PusherServer({
//     appId : "1840810",
//     key : "9cddcb9fbf3e26f8553b",
//     secret : "157781935c2c72cfaf68",
//     cluster : "us2",
//     useTLS : true
// });
export const pusherServer = new PusherServer({
    appId : process.env.PUSHER_APP_ID!,
    key : process.env.PUSHER_API_KEY!,
    secret : process.env.PUSHER_APP_SECRET!,
    cluster : process.env.PUSHER_CLUSTER!,
    useTLS : true
});

export const pusherClient = new PusherClient(
    "9cddcb9fbf3e26f8553b",
    {
        cluster : "us2",
    }
);

export const pusher = new Pusher({
    appId : process.env.PUSHER_APP_ID!,
    key : process.env.PUSHER_API_KEY!,
    secret : process.env.PUSHER_APP_SECRET!,
    cluster : process.env.PUSHER_CLUSTER!,
    useTLS : true
});