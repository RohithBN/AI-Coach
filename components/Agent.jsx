'use client'
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { cn } from '@/lib/utils'
import { interviewer } from '@/app/lib/constants';
import { Mic, Phone, PhoneOff, Code, Sparkles, Wand2 } from 'lucide-react';

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
    <div className="w-full mt-8 border border-gray-800/40 rounded-2xl backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-black/90 to-gray-900/90 rounded-2xl min-h-32 px-8 py-6 flex items-center justify-center">
            <p className="text-lg md:text-xl transition-opacity duration-500 text-white/90 leading-relaxed animate-fadeIn">
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
    };
    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) {
          if (type === 'generate') {
            router.push('/interviews');
          } else if (messages.length > 0) {
            // Only call handleGenerateFeedback if we have the required data
            if (userId && interviewId) {
              handleGenerateFeedback(messages);
            } else {
              console.error("Missing userId or interviewId for feedback generation", {
                userId,
                interviewId
              });
            }
          }
        }
      }, [callStatus, type, messages, userId, interviewId, router]);

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
        <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto p-6 relative">
            {/* Background Elements */}
            <div className="fixed inset-0 bg-black/40 -z-10"></div>
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(25,25,25,0.2),transparent_70%)] -z-10"></div>
            
            {/* Header */}
            <div className="w-full text-center mb-4">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400">
                    {type === 'generate' ? 'Mock Interview Session' : 'Technical Interview'}
                </h2>
                <p className="mt-2 text-gray-400">Enhance your interview skills with our advanced AI interviewer</p>
            </div>

            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-3 p-2 rounded-lg bg-white/5 w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">Speak Clearly</h3>
              <p className="text-sm text-white/60 leading-relaxed">Use a natural voice at a moderate pace with good enunciation for optimal recognition.</p>
            </div>
            
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-3 p-2 rounded-lg bg-white/5 w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">Elaborate</h3>
              <p className="text-sm text-white/60 leading-relaxed">Provide detailed responses with concrete examples from your own experience when possible.</p>
            </div>
            
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-3 p-2 rounded-lg bg-white/5 w-10 h-10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-white font-medium text-lg mb-2">Test Audio</h3>
              <p className="text-sm text-white/60 leading-relaxed">Ensure your microphone is working correctly and there's no background noise before starting.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-10 items-stretch justify-between w-full">
    {/* AI Interviewer Card */}
    <div className="flex flex-col items-center h-[420px] gap-2 p-8 w-full sm:w-1/2 bg-white/5 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex mt-10 z-10 items-center justify-center">
            <div className="relative flex items-center justify-center rounded-full w-48 h-48 p-2 bg-white/5">
                <Image
                    src="/ai-avatar.png"
                    alt="AI Interviewer"
                    width={180}
                    height={180}
                    className="object-cover rounded-full p-0.5"
                />
                {isSpeaking && (
                    <>
                        <span className="absolute inset-0 rounded-full animate-ping bg-blue-400/10 opacity-75" />
                        <span className="absolute -bottom-14 flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium text-white shadow-lg">
                            <Mic className="h-4 w-4 animate-pulse" />
                            Speaking...
                        </span>
                    </>
                )}
            </div>
        </div>
        
        <div className="flex flex-col items-center mt-16 z-10 space-y-3">
            <h3 className="text-white font-medium text-lg mb-2">Interviewer</h3>
        </div>
    </div>

    {/* User Card */}
    <div className="hidden sm:block w-full sm:w-1/2">
        <div className="flex flex-col gap-4 h-[420px] justify-center items-center p-8 bg-white/5 rounded-2xl border border-white/10 shadow-lg transition-all hover:border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10 mt-4">
                <div className="rounded-full p-2 bg-white/5">
                    <Image
                        src="/user-avatar.png"
                        alt="User Avatar"
                        width={180}
                        height={180}
                        className="rounded-full object-cover"
                    />
                </div>
            </div>
            
            <div className="flex flex-col items-center space-y-3 z-10 mt-12">
                <h3 className="text-white font-medium text-lg mb-2">
                    {username || "Candidate"}
                </h3>
            </div>
        </div>
    </div>
</div>

            {/* Message Display */}
            {messages.length > 0 && <MessageDisplay content={latestMessage} />}

            {/* Call Controls */}
            <div className="w-full flex justify-center mt-8 relative">
                <div className="absolute inset-x-0 -top-16 h-40 bg-gradient-to-t from-black/80 to-transparent -z-10"></div>
                {callStatus !== CallStatus.ACTIVE ? (
                    <button
                        className={cn(
                            "relative px-10 py-5 text-base font-bold text-white rounded-full",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500",
                            "transition-all duration-300 ease-in-out transform hover:scale-105",
                            "flex items-center gap-3",
                            isLoading 
                                ? "bg-gray-800 border border-gray-700 cursor-not-allowed" 
                                : "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 shadow-lg shadow-gray-700/20 border border-gray-600/30"
                        )}
                        onClick={handleCall}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-transparent animate-spin"></div>
                                <span className="relative">Connecting...</span>
                            </>
                        ) : (
                            <>
                                <Phone className="h-5 w-5" />
                                <span className="relative">
                                    {isCallInactiveOrFinished ? "Start Interview" : ". . ."}
                                </span>
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        className="px-10 py-5 text-base font-bold text-white bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 shadow-lg shadow-red-700/20 transition-all duration-300 flex items-center gap-3 border border-red-600/30"
                        onClick={handleDisconnect}
                    >
                        <PhoneOff className="h-5 w-5" />
                        End Interview Session
                    </button>
                )}
            </div>
            
            {/* Status Indicator */}
            <div className="w-full flex justify-center mt-4">
                <div className="px-4 py-2 bg-gray-900/70 rounded-full border border-gray-800/40">
                    <p className="text-sm text-gray-400">
                        {callStatus === CallStatus.INACTIVE && "Waiting to start interview..."}
                        {callStatus === CallStatus.CONNECTING && "Establishing connection..."}
                        {callStatus === CallStatus.ACTIVE && "Interview in progress"}
                        {callStatus === CallStatus.FINISHED && "Interview completed"}
                    </p>
                </div>
            </div>
        </div>
    )
}

Agent.propTypes = {
    username: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    interviewId: PropTypes.string.isRequired,
    questions: PropTypes.arrayOf(PropTypes.string)
  };

export default Agent;