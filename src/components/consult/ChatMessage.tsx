import { IconSparkles } from '@tabler/icons-react';
import type { JSX } from 'react';
import type { ConsultMessage } from '../../services/ai-consult.service';
import { AIDisclaimer } from './AIDisclaimer';
import classes from './ChatMessage.module.css';

interface ChatMessageProps {
  message: ConsultMessage;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps): JSX.Element {
  const isUser = message.role === 'user';

  return (
    <div className={`${classes.wrapper} ${isUser ? classes.user : classes.assistant}`}>
      <div className={`${classes.bubble} ${isUser ? classes.userBubble : classes.aiBubble}`}>
        {!isUser && (
          <div className={classes.aiHeader}>
            <IconSparkles size={14} color="var(--oly-ai-glow)" />
            <span className={classes.aiLabel}>AI Consult</span>
            {isStreaming && <span className={classes.streaming} />}
          </div>
        )}
        <div className={classes.content}>{message.content}</div>
        {!isUser && message.content && <AIDisclaimer />}
      </div>
    </div>
  );
}
