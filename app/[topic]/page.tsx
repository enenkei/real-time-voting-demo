import { redis } from '@/lib/redis';
import React from 'react';
import ClientPage from './_components/client-page';

type Props = {
    params : {
        topic : string
    }
}

const TopicPage = async ({params} : Props) => {
    const {topic} = params;

    //e.g. initialData = [redis, 3, is, 2, great, 6];
    const initialData = await redis.zrange<(string | number)[]>(`room:${topic}`, 0, 49, {withScores : true});//fetching first 50 elements
    const words : {text : string, value : number}[] = [];

    for(let i = 0; i < initialData.length; i++){
        const [text,value] = initialData.slice(i, i+2);
        if(typeof text === 'string' && typeof value === 'number') {
            words.push({text,value});
        }
    }

    await redis.incr("served-requests");

    return <ClientPage initialData={words} topicName={topic}/>
}

export default TopicPage;
