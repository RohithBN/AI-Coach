'use client'
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'
import { interviewer } from '@/app/lib/constants';

const CallStatus = {
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
    CONNECTING: 'CONNECTING',
};

const MessageType = {
    TRANSCRIPT: "transcript",
    FUNCTION_CALL: "function-call",
    FUNCTION_CALL_RESULT: "function-call-result",
    ADD_MESSAGE: "add-message",
};

const MessageRole = {
    USER: "user",
    SYSTEM: "system",
    ASSISTANT: "assistant",
};

const TranscriptMessageType = {
    PARTIAL: "partial",
    FINAL: "final",
};

const MessageDisplay = ({ content }) => (
    <div className="w-full mt-6 border rounded-2xl">
        <div className="bg-gray-100 rounded-2xl min-h-12 px-5 py-3 flex items-center justify-center">
            <p className="text-lg transition-opacity duration-500 text-black animate-fadeIn">
                {content}
            </p>
        </div>
    </div>
)

MessageDisplay.propTypes = {
    content: PropTypes.string
}

const Agent = ({username, userId, type,interviewId,questions}) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [messages, setMessages] = useState(() => /** @type {Array<{role: string, content: string}>} */ ([]));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE);
        }
        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
        }
        const onMessage = (message) => {
            if (message.type === MessageType.TRANSCRIPT && 
                message.transcriptType === TranscriptMessageType.FINAL) {
                const newMessage = {
                    role: message.role,
                    content: message.transcript
                }
                setMessages((prev) => [...prev, newMessage]);
            }
        }
        const onSpeakingStart = () => {
            setIsSpeaking(true);
        }
        const onSpeakingEnd = () => {
            setIsSpeaking(false);
        }
        const onError = (error) => {
            console.error('VAPI Error:', error);
            setCallStatus(CallStatus.INACTIVE);
        }

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("message", onMessage);
        vapi.on("speaking-start", onSpeakingStart);
        vapi.on("speaking-end", onSpeakingEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("message", onMessage);
            vapi.off("speaking-start", onSpeakingStart);
            vapi.off("speaking-end", onSpeakingEnd);
            vapi.off("error", onError);
        }
    }, []);
    const handleGenerateFeedback = async(messages) => {
        if (!messages?.length || !interviewId || !userId) {
            console.error("Missing required fields:", { messages, interviewId, userId });
            return;
        }
    
        console.log("Generating feedback for interview:", interviewId);
        
        try {
            setIsLoading(true);
            
            const response = await fetch('/api/generate-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    interviewId,
                    userId
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            
            if (data.success && data.id) {
                router.push(`/interview-id/${interviewId}/feedback`);
            } else {
                throw new Error(data.error || 'Failed to generate feedback');
            }
        } catch (error) {
            console.error("Failed to generate feedback:", error);
            // TODO: Add toast notification here
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => {
        if(callStatus === CallStatus.FINISHED) {
            if(type=='generate'){
                router.push('/interviews')
            }else{
                handleGenerateFeedback(messages)
            }
        }
        if(callStatus === CallStatus.FINISHED) {
            const timeout = setTimeout(() => {
                router.push('/interviews');
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [callStatus, router]);

    const handleCall = async () => {
        setIsLoading(true);
        setCallStatus(CallStatus.CONNECTING);
        try {
            if(type=='generate'){
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
                variableValues: {
                    username,
                    userid: userId,
                }
            });
        }else{
            let formattedQuestions=''
            if(questions){
                formattedQuestions=questions.map((question)=>`${question}`).join('\n')
                console.log("Formatted questions:",formattedQuestions)
            }
            await vapi.start(interviewer,{
                variableValues:{
                    username,
                    questions:formattedQuestions
                }
            })
        }
        } catch (error) {
            console.error('Failed to start call:', error);
            setCallStatus(CallStatus.INACTIVE);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDisconnect = async () => {
        try {
            await vapi.stop();
            setCallStatus(CallStatus.FINISHED);
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    }

    const latestMessage = messages[messages.length-1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto p-4">
            <div className="flex flex-col sm:flex-row gap-10 items-center justify-between w-full">
                {/* AI Interviewer Card */}
                <div className="flex flex-col items-center h-96 gap-2 p-4 w-full sm:w-1/2 bg-gray-400/10 rounded-lg border border-blue-200/50 backdrop-blur-sm">
                    <div className="relative flex  mt-16 items-center justify-center rounded-full w-32 h-32">
                        <Image
                            src="/ai-avatar.png"
                            alt="AI Interviewer"
                            width={128}
                            height={128}
                            className="object-cover rounded-full"
                        />
                        {isSpeaking && (
                            <span className="absolute inset-0 rounded-full animate-ping bg-blue-200 opacity-75" />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold mt-4">AI Interviewer</h3>
                </div>

                {/* User Card */}
                <div className="hidden sm:block w-full sm:w-1/2">
                    <div className="flex flex-col gap-4 h-96 justify-center items-center p-4 bg-gray-300/10 rounded-2xl backdrop-blur-sm border border-gray-200/50">
                        <Image
                            src="/ai-avatar.png"
                            alt="User Avatar"
                            width={128}
                            height={128}
                            className="rounded-full object-cover"
                        />
                        <h3 className="text-xl font-semibold">{username}</h3>
                    </div>
                </div>
            </div>

            {/* Message Display */}
            {messages.length > 0 && <MessageDisplay content={latestMessage} />}

            {/* Call Controls */}
            <div className="w-full flex justify-center mt-6">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        className={cn(
                            "relative px-7 py-3 text-sm font-bold text-white rounded-full",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2",
                            isLoading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                        )}
                        onClick={handleCall}
                        disabled={isLoading}
                    >
                        <span className="relative">
                            {isLoading ? "Connecting..." : 
                                (isCallInactiveOrFinished ? "Call" : ". . .")}
                        </span>
                    </button>
                ) : (
                    <button
                        className="px-7 py-3 text-sm font-bold text-white bg-red-500 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={handleDisconnect}
                    >
                        End
                    </button>
                )}
            </div>
        </div>
    )
}

Agent.propTypes = {
    username: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    type: PropTypes.string
}

export default Agent