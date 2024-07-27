'use server';

import { pusher } from "@/lib/pusher";
import { redis } from "@/lib/redis";
import { genUUID } from "@/lib/utils";
import { redirect } from "next/navigation";

export interface WordData {
    text: string;
    value: number;
}

export const createTopic = async ({ topicName }: { topicName: string }) => {
    const regex = /^[a-zA-Z-]+$/;
    if (!topicName || topicName.length > 50) {
        return { error: 'Name must be between 1 and 50 characters' };
    }
    if (!regex.test(topicName)) {
        return { error: 'Only letters and hyphens are allowed' };
    }
    await redis.sadd('existing-topics', topicName);
    const subscribedRooms = await redis.smembers("subscribed-rooms");
    const uuid = genUUID();
    await redis.sadd(`room:${uuid}`, topicName);
    await redis.hincrby('room-connections', topicName, 1);
    if(!subscribedRooms.includes(topicName)){
        pusher.trigger(`room_${topicName}`, 'join_room', 'room_created');
        await redis.sadd("subscribed-rooms", topicName);
        console.log('subscribing room ' + topicName);
    }    
    redirect(`/${topicName}`);
}

function wordFreq(text: string): WordData[] {
    const words: string[] = text.replace(/\./g, '').split(/\s/);
    const freqMap: Record<string, number> = {};

    for (const w of words) {
        if (!freqMap[w]) freqMap[w] = 0;
        freqMap[w] += 1;
    }
    return Object.keys(freqMap).map((word) => ({ text: word, value: freqMap[word] }));
}

export const submitComment = async ({ comment, topicName }: { comment: string, topicName: string }) => {
    const words = wordFreq(comment);

    await Promise.all(words.map(async(word) => {
        await redis.zadd(`room:${topicName}`, {incr : true}, {member : word.text, score : word.value})
    }));

    await redis.incr('served-requests');
    await redis.publish(`room:${topicName}`, words);
    pusher.trigger(`room_${topicName}`, 'voting', words);
    return comment;
}