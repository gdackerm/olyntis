import { IconSend } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useRef } from 'react';
import classes from './ConsultChatInput.module.css';

interface ConsultChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ConsultChatInput({ value, onChange, onSend, disabled }: ConsultChatInputProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    }
  };

  return (
    <div className={classes.container}>
      <textarea
        ref={textareaRef}
        className={classes.textarea}
        placeholder="Ask about this patient..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
      />
      <button
        className={classes.sendButton}
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <IconSend size={18} />
      </button>
    </div>
  );
}
