import { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export interface ArtifactVersion {
  id: string;
  timestamp: number;
  content: string;
  source: 'ai' | 'user';
}

export function useDeepResearch() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [artifact, setArtifact] = useState<string>('');
  const [versions, setVersions] = useState<ArtifactVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);

  const saveUserVersion = (content: string) => {
    if (!content.trim()) return;
    if (versions.length > 0 && versions[versions.length - 1].content === content) return;
    
    setVersions((prev) => [
      ...prev,
      { id: Date.now().toString(), timestamp: Date.now(), content, source: 'user' }
    ]);
  };

  const restoreVersion = (versionId: string) => {
    const v = versions.find(v => v.id === versionId);
    if (v) {
      setArtifact(v.content);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    if (!chatRef.current) {
      chatRef.current = ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
          systemInstruction: `You are an expert Deep Research AI Assistant.
Your goal is to conduct comprehensive research on the user's topic using Google Search.
You must output your response in two parts, separated EXACTLY by the delimiter "---REPORT---".

Part 1 (Before delimiter): A brief, conversational update to the user about what you found or are researching.
Part 2 (After delimiter): A highly detailed, well-structured, and comprehensive Markdown report on the topic.

CRITICAL CITATION RULES FOR PART 2:
1. Every key claim, statistic, or factual statement MUST be cited using inline Markdown links pointing to the authoritative source URL.
2. You MUST use the Google Search tool to find real, authoritative sources. Embed the real URLs from your search results directly into the Markdown.
3. Format citations like this: [Source Name](https://example.com) or as footnote-style links: [1](https://example.com).
4. Always include a "## References" section at the very end of the report listing all the URLs used.

Example:
I have researched the latest advancements in quantum computing. Here is a summary of the key breakthroughs.
---REPORT---
# Quantum Computing in 2025
## Key Breakthroughs
Recent studies show a 50% reduction in error rates [Nature Journal](https://nature.com/...).
...
## References
- [Nature Journal: Quantum Error Correction](https://nature.com/...)`,
          tools: [{ googleSearch: {} }],
        },
      });
    }

    const newModelMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: '' };
    setMessages((prev) => [...prev, newModelMsg]);

    let finalReportPart = '';

    try {
      const stream = await chatRef.current.sendMessageStream({ message: text });
      let fullText = '';
      let chatPart = '';
      let reportPart = '';
      let isReportStarted = false;

      for await (const chunk of stream) {
        const chunkText = chunk.text || '';
        fullText += chunkText;

        if (!isReportStarted) {
          const delimiterIndex = fullText.indexOf('---REPORT---');
          if (delimiterIndex !== -1) {
            isReportStarted = true;
            chatPart = fullText.substring(0, delimiterIndex).trim();
            reportPart = fullText.substring(delimiterIndex + '---REPORT---'.length);
            
            setMessages((prev) => 
              prev.map((msg) => msg.id === newModelMsg.id ? { ...msg, content: chatPart } : msg)
            );
            setArtifact(reportPart);
            finalReportPart = reportPart;
          } else {
            setMessages((prev) => 
              prev.map((msg) => msg.id === newModelMsg.id ? { ...msg, content: fullText } : msg)
            );
          }
        } else {
          reportPart += chunkText;
          setArtifact(reportPart);
          finalReportPart = reportPart;
        }
      }
    } catch (error) {
      console.error("Error generating research:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'model', content: 'An error occurred while researching. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
      if (finalReportPart.trim()) {
        setVersions((prev) => [
          ...prev,
          { id: Date.now().toString(), timestamp: Date.now(), content: finalReportPart, source: 'ai' }
        ]);
      }
    }
  };

  return { messages, artifact, versions, isLoading, sendMessage, setArtifact, saveUserVersion, restoreVersion };
}
