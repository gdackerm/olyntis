import { useCallback, useRef, useState } from 'react';
import { assemblePatientContext } from '../services/ai-context.service';
import { streamConsult } from '../services/ai-consult.service';
import type { ConsultMessage } from '../services/ai-consult.service';

export function useAIConsult(patientId: string | undefined) {
  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!patientId || !content.trim() || isStreaming) return;

      setError(null);
      abortRef.current = false;

      const userMessage: ConsultMessage = { role: 'user', content: content.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);

      // Assemble fresh patient context each time
      let context;
      try {
        context = await assemblePatientContext(patientId);
      } catch (err) {
        setError('Failed to load patient data');
        setIsStreaming(false);
        return;
      }

      // Add placeholder for streaming assistant message
      const assistantMessage: ConsultMessage = { role: 'assistant', content: '' };
      setMessages([...updatedMessages, assistantMessage]);

      await streamConsult(
        patientId,
        updatedMessages,
        context,
        // onChunk
        (text) => {
          if (abortRef.current) return;
          assistantMessage.content += text;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...assistantMessage };
            return next;
          });
        },
        // onComplete
        (_fullText) => {
          setIsStreaming(false);
        },
        // onError
        (errMsg) => {
          setError(errMsg);
          setIsStreaming(false);
          // Remove empty assistant message if error
          if (!assistantMessage.content) {
            setMessages(updatedMessages);
          }
        },
      );
    },
    [patientId, messages, isStreaming],
  );

  const clearConversation = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  return { messages, sendMessage, isStreaming, error, clearConversation };
}
