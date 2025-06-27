'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './ChatInput.module.css';

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  sendMessage, 
  secondaryColor = '#4a6baf',
  disabled = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !disabled && inputMessage.trim()) {
      sendMessage(inputMessage);
      // Reset input after sending (controlled by parent)
    }
  };

  const handleSendClick = () => {
    if (!disabled && inputMessage.trim()) {
      sendMessage(inputMessage);
      // Reset input after sending (controlled by parent)
    }
  };

  // Auto-focus input when not disabled
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <div 
      className={styles.chatInputContainer}
      style={{ 
        '--secondary-color': secondaryColor,
        '--secondary-color-light': `${secondaryColor}20`,
      }}
      data-focused={isFocused}
      data-disabled={disabled}
    >
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={styles.chatInput}
          placeholder="Ask your medical or health question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          aria-label="Type your message"
        />
        {inputMessage && (
          <button 
            className={styles.clearButton}
            onClick={() => setInputMessage('')}
            aria-label="Clear message"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18" />
              <path d="M6 6L18 18" />
            </svg>
          </button>
        )}
      </div>
      
      <button 
        className={styles.chatButton} 
        onClick={handleSendClick}
        aria-label="Send message"
        disabled={disabled || !inputMessage.trim()}
        data-disabled={disabled || !inputMessage.trim()}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;