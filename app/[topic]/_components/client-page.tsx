'use client';
import MaxWidthWrapper from '@/components/max-width-wrapper';
import React, { useEffect, useState } from 'react';
import {Wordcloud} from '@visx/wordcloud';
import {scaleLog} from '@visx/scale';
import { Text } from '@visx/text';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { submitComment } from '@/app/actions';
import { pusherClient } from '@/lib/pusher';

type Props = {
    topicName: string,
    initialData: { text: string, value: number }[]
}

const colors = ['#143059', '#2F6B9A', '#82a6c2'];

const ClientPage = ({ topicName, initialData }: Props) => {
    const [words, setWords] = useState(initialData);
    const [input,setInput] = useState<string>("");

    useEffect(() => {
        var channel = pusherClient.subscribe(`room_${topicName}`);
        channel.bind('voting', function(message : {text : string, value : number}[]) {
            // console.log(message);
            // const data = JSON.parse(message) as {
            //     text : string,
            //     value : number
            // }[];
            message.map((newWord) => {
                const isWordAlreadyIncluded = words.some((word) => word.text === newWord.text);
                if(isWordAlreadyIncluded){
                    setWords((prev : any) => {
                        const before = prev.find((word : any) => word.text === newWord.text);
                        const rest = prev.filter((word : any) => word.text != newWord.text);
                        return [...rest, {text : before?.text, value : before?.value!+1}];
                    })
                }else if(words.length < 50){
                    setWords((prev) => [...prev, newWord]);
                }
            })
        });

    }, [input, setInput]);

    const fontScale = scaleLog({
        domain : [
            Math.min(...words.map((w) => w.value)),
            Math.max(...words.map((w) => w.value))
        ],
        range : [10,100]
    });

    const {mutate, error, isPending} = useMutation({
        mutationFn : submitComment
    })
    return (
        <div className='w-full flex flex-col items-center justify-center min-h-screen bg-grid-zinc-50 pb-20'>
            <MaxWidthWrapper className='flex flex-col items-center gap-6 pt-20'>
                <h1 className='text-4xl sm:text-5xl font-bold text-center tracking-tight text-balance'>
                    What people think about&nbsp;
                    <span className='text-blue-600'>{topicName}</span>
                </h1>
                <p className='text-sm text-muted-foreground'>(updated in real-time)</p>
                <div className='aspect-square max-w-xl flex items-center justify-center'>
                    <Wordcloud 
                        words={words} 
                        width={500} 
                        height={500} 
                        fontSize={(data) => fontScale(data.value)}
                        font={"Impact"}
                        padding={2}
                        spiral={'archimedean'}
                        rotate={0}
                        random={() => 0.5}
                    >
                        {(cloudWords) => cloudWords.map((word, idx) => (
                            <Text key={idx+word.text!} 
                                fill={colors[idx % colors.length]} 
                                textAnchor='middle' 
                                transform={`translate(${word.x}, ${word.y})`}
                                fontSize={word.size}
                                fontFamily={word.font}
                            >
                                {word.text}
                            </Text>
                        ))}
                    </Wordcloud>
                </div>
                <div className='max-w-lg w-full'>
                    <Label className='font-semibold tracking-tight text-lg pb-2'>
                        Here&apos;s what I think about {topicName}
                    </Label>
                    <div className='mt-1 flex gap-2 items-center'>
                        <Input value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`${topicName} is absolutely...`} />
                        <Button disabled={isPending} onClick={() => mutate({comment : input, topicName})}>
                            Share
                        </Button>
                    </div>
                </div>
            </MaxWidthWrapper>
        </div>
    )
}

export default ClientPage;
