'use client';
import styles from './ChatHeader.module.css';

const ChatHeader = ({ 
  secondaryColor = 'tomato', 
  connectionStatus = 'connected', 
  onClose,
  primaryColor = '#4a6baf'
}) => {
  const getConnectionStatus = () => {
    switch(connectionStatus) {
      case 'connected': 
        return { text: 'Online', color: '#4CAF50' };
      case 'connecting': 
        return { text: 'Connecting...', color: '#FFC107' };
      case 'disconnected': 
        return { text: 'Offline', color: '#F44336' };
      default: 
        return { text: 'Unknown', color: '#9E9E9E' };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className={styles.chatHeader} style={{ 
  backgroundColor: 'tomato',
  borderBottom: '1px solid gray'
}}>

      <div className={styles.headerContent}>
        <div className={styles.headerInfo}>
          <div className={styles.avatarContainer}>
            <div className={styles.medicalAvatar}>👨</div>
            <div 
              className={styles.statusIndicator} 
              style={{ backgroundColor: status.color }}
              title={status.text}
            />
          </div>
          
          <div className={styles.titleContainer}>
            <h2 className={styles.title}>Medical Support</h2>
            <p className={styles.subtitle}>Dr. Sanjay - AI Health Assistant</p>
          </div>
        </div>

        <div className={styles.headerActions}>
        
          
         <button 
  className={styles.closeButton}
  onClick={onClose}
  style={{
    color: 'white',              // text color
     
  }}
  aria-label="Close chat"
>
  ×
</button>

        </div>
      </div>
    </div>
  );
};

export default ChatHeader;