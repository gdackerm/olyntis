import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { ConsultMessage } from '../../services/ai-consult.service';
import { ChatMessage } from './ChatMessage';
import { ConsultChatInput } from './ConsultChatInput';
import { SafetyBanner } from './SafetyBanner';
import { SuggestedPrompts } from './SuggestedPrompts';
import classes from './ChatArea.module.css';

interface ChatAreaProps {
  messages: ConsultMessage[];
  isStreaming: boolean;
  error: string | null;
  onSend: (content: string) => void;
  hasPatient: boolean;
}

export function ChatArea({ messages, isStreaming, error, onSend, hasPatient }: ChatAreaProps): JSX.Element {
  const [input, setInput] = useState('');
  const messagesAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesAreaRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
  };

  const handlePromptSelect = (prompt: string) => {
    onSend(prompt);
  };

  return (
    <div className={classes.container}>
      <div className={classes.bannerArea}>
        <SafetyBanner />
      </div>

      <div className={classes.messagesArea} ref={messagesAreaRef}>
        {hasPatient && messages.length === 0 ? (
          <SuggestedPrompts onSelect={handlePromptSelect} />
        ) : (
          <div className={classes.messagesList}>
            {messages.map((msg, i) => (
              <ChatMessage
                key={i}
                message={msg}
                isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}
            {error && (
              <div className={classes.error}>{error}</div>
            )}
          </div>
        )}
      </div>

      {hasPatient && (
        <div className={classes.inputArea}>
          <ConsultChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={isStreaming || !hasPatient}
          />
        </div>
      )}
    </div>
  );
}
