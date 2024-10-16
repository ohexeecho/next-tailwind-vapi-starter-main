"use client";
import React, { useState, useRef, useEffect } from "react";
import { DynamicIslandProvider, SIZE_PRESETS, useDynamicIslandSize, DynamicIsland, DynamicContainer, DynamicTitle, DynamicDiv, DynamicDescription } from "@/components/dynamic-island";
import useVapi from "../hooks/use-vapi";
import { Loader } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black text-white p-4">
        <h1 className="text-2xl font-bold">Big Mike AI</h1>
      </header>

      {/* Video Space */}
      <div className="flex-grow flex items-center justify-center relative">
        <video
          id="background-video"
          className="w-full max-w-3xl aspect-video object-cover"
          src="/video.mp4"
          loop
          muted
          playsInline
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Dynamic Island Component */}
      <div className="mb-8">
        <DynamicIslandProvider initialSize={SIZE_PRESETS.DEFAULT}>
          <VapiDynamicIsland />
        </DynamicIslandProvider>
      </div>
    </div>
  );
};

const VapiDynamicIsland = () => {
  const { toggleCall, isSessionActive, volumeLevel, conversation } = useVapi();
  const { setSize } = useDynamicIslandSize();
  const [isStartingCall, setIsStartingCall] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    if (isSessionActive) {
      setIsStartingCall(false);
 
      if (volumeLevel > 0) {
        setIsListening(false);
        if (timer) {
          clearTimeout(timer);
          setTimer(null);
        }
        setSize(SIZE_PRESETS.TALL);
      } else if (volumeLevel === 0 && !isListening) {
        if (!timer) {
          const newTimer = setTimeout(() => {
            setIsListening(true);
            setSize(SIZE_PRESETS.COMPACT);
          }, 1500);
          setTimer(newTimer);
        }
      }
 
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } else {
      setIsEndingCall(false);
      setIsListening(false);
      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
      setSize(SIZE_PRESETS.DEFAULT); // Reset size when session is inactive
    }
    if(!isSessionActive || isListening){
      setSize(SIZE_PRESETS.DEFAULT);
    }
  }, [isSessionActive, setSize, volumeLevel, timer, conversation, isListening]);
 
  const handleDynamicIslandClick = async () => {
    if (isSessionActive) {
      setIsEndingCall(true);
      await toggleCall();
      setSize(SIZE_PRESETS.DEFAULT); // Reset to default size after ending call
    } else {
      setIsStartingCall(true);
      await toggleCall();
      setIsStartingCall(false);
      setSize(SIZE_PRESETS.DEFAULT);
    }
  };
 
  const handleEndCall = async () => {
    setIsEndingCall(true);
    await toggleCall();
    setIsEndingCall(false);
    setSize(SIZE_PRESETS.DEFAULT);
  };
 
  const renderState = () => {
    if (isStartingCall || isEndingCall) {
      return (
        <DynamicContainer className="flex items-center justify-center h-full w-full">
          <Loader className="animate-spin h-12 w-12 text-yellow-300" />
          <DynamicTitle className="ml-2 text-2xl font-black tracking-tighter text-white my-2 mr-3">
            {isStartingCall ? "Starting" : "Ending"}
          </DynamicTitle>
        </DynamicContainer>
      );
    }
 
    if (!isSessionActive) {
      return (
        <DynamicContainer className="flex items-center justify-center h-full w-full">
          <DynamicTitle className="text-2xl font-black tracking-tighter text-white my-2">Start Call</DynamicTitle>
        </DynamicContainer>
      );
    }
 
    if (isListening) {
      return (
        <DynamicContainer className="flex flex-col items-center justify-center h-full w-full">
          <DynamicTitle className="text-2xl font-black tracking-tighter text-white">
            Listening...
          </DynamicTitle>
        </DynamicContainer>
      );
    }
 
    const assistantMessages = conversation.filter(msg => msg.role === 'assistant').slice(-2);
 
    return (
      <DynamicContainer className="flex flex-col h-full w-full px-4 py-2 space-y-2">
        {assistantMessages.map((message, index) => (
          <DynamicDiv key={index} className="flex justify-start">
            <div className="bg-cyan-300 rounded-2xl tracking-tight leading-5 my-1">
              <DynamicDescription className="bg-cyan-300 rounded-2xl tracking-tight leading-5 text-white text-left px-1">{message.text}</DynamicDescription>
            </div>
          </DynamicDiv>
        ))}
      </DynamicContainer>
    );
  };
 
  return (
    <div onClick={handleDynamicIslandClick} className="cursor-pointer">
      <DynamicIsland id="vapi-dynamic-island">
        {renderState()}
      </DynamicIsland>
    </div>
  );
};
 
export default Home;
