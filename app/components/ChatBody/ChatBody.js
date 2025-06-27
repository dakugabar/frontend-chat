'use client';
import { useEffect, useRef, useState } from 'react'; // Added useRef import
import styles from './ChatBody.module.css';

const ChatBody = ({ 
  messages, 
  isLoading,
  primaryColor = '#4a6baf',
  secondaryColor = 'tomato',
  suggestedKeywords = [],
  onKeywordClick
}) => {
  const messagesEndRef = useRef(null);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format time for messages
 const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
};


  // Check for emergency messages
  useEffect(() => {
    const hasEmergency = messages.some(msg => 
      msg.isEmergency || 
      (msg.message && typeof msg.message === 'string' && 
       msg.message.toLowerCase().includes('emergency'))
    );
    setEmergencyMode(hasEmergency);
  }, [messages]);

  return (
    <div className={styles.chatBox}>
      {emergencyMode && (
        <div className={styles.emergencyBanner} style={{ backgroundColor: secondaryColor }}>
          <strong>Emergency Alert:</strong> If this is a life-threatening situation, please call your local emergency number immediately.
        </div>
      )}
      
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`${styles.chatMessage} ${msg.isAdmin ? styles.admin : styles.user}`}
            style={{
              backgroundColor: msg.isAdmin ? '#fff' : `${primaryColor}20`,
              border: msg.isAdmin ? 'none' : `1px solid ${primaryColor}`,
              borderLeft: msg.isEmergency ? `4px solid ${secondaryColor}` : 'none'
            }}
          >
            <div className={styles.messageContent}>
              <div 
                className={styles.messageText} 
                dangerouslySetInnerHTML={{ __html: msg.message.replace(/\n/g, '<br>') }} 
                style={{ color: msg.isAdmin ? '#333' : primaryColor }}
              />
              <div className={styles.messageFooter}>
                <span className={styles.messageTimestamp}>{formatTime(msg.createdAt)}</span>
                {!msg.isAdmin && (
                  <span className={styles.messageStatusContainer}>
                    <span className={styles.messageStatus}>
                      {msg.isSeen ? '✓✓' : '✓'}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDot} style={{ backgroundColor: secondaryColor }} />
            <div className={styles.typingDot} style={{ backgroundColor: secondaryColor }} />
            <div className={styles.typingDot} style={{ backgroundColor: secondaryColor }} />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Keyword Suggestions */}
      {suggestedKeywords.length > 0 && (
        <div className={styles.keywordSuggestionsContainer}>
          <div className={styles.keywordSuggestions}>
            
            <div className={styles.keywordList}>
              {suggestedKeywords.map((keyword, index) => (
                <button
                  key={index}
                  className={styles.keywordPill}
                  style={{ 
                    backgroundColor: primaryColor,
                    color: 'white'
                  }}
                  onClick={() => onKeywordClick(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBody;