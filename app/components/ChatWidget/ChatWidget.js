'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './ChatWidget.module.css';
import ChatHeader from '../ChatHeader/ChatHeader';
import ChatBody from '../ChatBody/ChatBody';
import ChatInput from '../ChatInput/ChatInput';
import ChatAvatar from '../ChatAvatar/ChatAvatar';

const ChatWidget = ({
  primaryColor = '#4a6baf',
  secondaryColor = 'tomato',
  widgetPosition = { right: '24px', bottom: '24px' },
  chatWindowSize = { width: '327px', height: '500px' },
  apiKey = 'AIzaSyAu7tN9BLxOgq8GP4uX1AoJ_IOdz8gs0lQ',
  showWelcomeOnce = true
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [medicalKeywords, setMedicalKeywords] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const hasShownWelcome = useRef(false);
  const welcomeMessage = useRef(null);

  const welcomeMessages = [
    "Hello! I'm Sanjay, your medical support assistant. I can help with health, body, and medical questions. What would you like to know?",
    "Welcome to medical chat support. I'm Sanjay, here to provide reliable health information. Please describe your health concern.",
    "Hi there! I'm Sanjay, your health assistant. I can provide information about medical conditions, body functions, and general health advice. How can I help?"
  ];

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/keywords');
        const data = await res.json();
        const keywordList = data.map(item => item.keyword.toLowerCase());
        setMedicalKeywords(keywordList);
        initializeSuggestedKeywords(keywordList);
      } catch (err) {
        console.error('Failed to fetch medical keywords:', err);
      }
    };
    fetchKeywords();
  }, []);

  const initializeSuggestedKeywords = (keywords) => {
    const shuffled = [...keywords].sort(() => 0.5 - Math.random());
    setSuggestedKeywords(shuffled.slice(0, 3));
  };

  const handleKeywordClick = (clickedKeyword) => {
    const updatedKeywords = suggestedKeywords.filter(kw => kw !== clickedKeyword);
    const usedMessages = messages.map(msg => msg.message.toLowerCase());

    const availableKeywords = medicalKeywords.filter(
      kw =>
        !usedMessages.includes(kw) &&
        !updatedKeywords.includes(kw) &&
        kw !== clickedKeyword
    );

    if (availableKeywords.length > 0) {
      const newKeyword = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
      updatedKeywords.push(newKeyword);
    }

    setSuggestedKeywords(updatedKeywords.slice(0, 3));
    handleSendMessage(clickedKeyword);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const isMedicalQuestion = (question) => {
    const emergencyKeywords = [
      'emergency', '911', 'urgent', 'heart attack', 'stroke', 'suicide', 'self-harm'
    ];
    const questionLower = question.toLowerCase();

    if (emergencyKeywords.some(kw => questionLower.includes(kw))) {
      setEmergencyMode(true);
      return true;
    }

    return medicalKeywords.some(kw => questionLower.includes(kw));
  };

  const generateAIResponse = async (question) => {
    if (!isMedicalQuestion(question)) {
      return {
        response: "I specialize in medical and health-related questions. Please ask about health, body functions, or medical conditions.",
        isEmergency: false
      };
    }

    try {
      setIsLoading(true);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Provide a concise (2-3 sentences), medically accurate response to: "${question}". 
                    Structure your response:
                    1. Brief explanation
                    2. Common causes if applicable
                    3. General advice/suggestions
                    4. Always add: "For personalized advice, please consult a healthcare professional."
                    Keep language simple and avoid complex medical jargon.
                    DO NOT include any introductory phrases like "Here's my response" or "As a medical assistant".`
            }]
          }]
        })
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      let rawResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const unwantedPrefixes = [
        "Okay, here's my response as Sanjay, the medical assistant:",
        "Here's my response:",
        "As a medical assistant,"
      ];

      unwantedPrefixes.forEach(prefix => {
        if (rawResponse.startsWith(prefix)) {
          rawResponse = rawResponse.substring(prefix.length).trim();
        }
      });

      let formattedResponse = rawResponse || "I'm sorry, I couldn't generate a response. For medical concerns, please consult a healthcare professional.";

      if (!formattedResponse.includes("consult a healthcare professional")) {
        formattedResponse += "\n\nFor personalized advice, please consult a healthcare professional.";
      }

      return {
        response: formattedResponse,
        isEmergency: emergencyMode
      };
    } catch (error) {
      console.error('Error generating answer:', error);
      return {
        response: "I'm having trouble responding right now. Please try again later or consult a doctor for urgent matters.",
        isEmergency: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      sender: 'user',
      message: text,
      createdAt: new Date().toISOString(),
      isAdmin: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { response, isEmergency } = await generateAIResponse(text);

      const botResponse = {
        sender: 'medical-support-bot',
        message: isEmergency
          ? `URGENT: ${response}\n\nPlease call emergency services if this is a life-threatening situation.`
          : response,
        createdAt: new Date().toISOString(),
        isAdmin: true,
        isEmergency
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'system',
        message: "Failed to get response. Please try again.",
        createdAt: new Date().toISOString(),
        isAdmin: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isChatOpen && messages.length === 0 && !hasShownWelcome.current) {
      welcomeMessage.current = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      const welcomeMsg = {
        sender: 'medical-support-bot',
        message: welcomeMessage.current,
        createdAt: new Date().toISOString(),
        isAdmin: true
      };
      setMessages([welcomeMsg]);
      hasShownWelcome.current = true;
    }
  }, [isChatOpen, messages.length]);

  return (
    <div className={styles.chatWidgetContainer} style={{
      right: widgetPosition.right,
      bottom: widgetPosition.bottom,
    }}>
      {isChatOpen && (
        <div className={styles.chatWidgetWindow} style={{
          width: chatWindowSize.width,
          height: chatWindowSize.height,
        }}>
          <ChatHeader
            secondaryColor={secondaryColor}
            connectionStatus={connectionStatus}
            onClose={handleCloseChat}
          />

          <ChatBody
            messages={messages}
            isLoading={isLoading}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            suggestedKeywords={suggestedKeywords}
            onKeywordClick={handleKeywordClick}
          />

          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            sendMessage={handleSendMessage}
            disabled={isLoading}
            emergencyMode={emergencyMode}
            primaryColor={primaryColor}
          />
        </div>
      )}

      <ChatAvatar
        isChatOpen={isChatOpen}
        secondaryColor={secondaryColor}
        onClick={() => setIsChatOpen(!isChatOpen)}
        emergencyMode={emergencyMode}
      />
    </div>
  );
};

export default ChatWidget;
