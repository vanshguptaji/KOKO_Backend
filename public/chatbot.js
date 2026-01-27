/**
 * Veterinary Chatbot SDK
 * Embeddable chatbot widget for any website
 * 
 * Usage:
 * <script src="https://your-domain.com/chatbot.js"></script>
 * 
 * With Configuration:
 * <script>
 *   window.VetChatbotConfig = {
 *     userId: "user_123",
 *     userName: "John Doe",
 *     petName: "Buddy",
 *     source: "marketing-website"
 *   };
 * </script>
 * <script src="https://your-domain.com/chatbot.js"></script>
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    API_BASE_URL: window.VetChatbotConfig?.apiUrl || window.location.origin,
    WIDGET_ID: 'vet-chatbot-widget',
    STORAGE_KEY: 'vet_chatbot_session',
  };

  // Get user configuration (if provided)
  const userConfig = window.VetChatbotConfig || {};

  // Session management
  let sessionId = null;

  // Generate unique session ID
  function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Get or create session ID
  function getSessionId() {
    if (sessionId) return sessionId;
    
    try {
      sessionId = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem(CONFIG.STORAGE_KEY, sessionId);
      }
    } catch (e) {
      sessionId = generateSessionId();
    }
    
    return sessionId;
  }

  // Styles for the chatbot widget
  const styles = `
    #vet-chatbot-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .vet-chatbot-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .vet-chatbot-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }

    .vet-chatbot-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }

    .vet-chatbot-container {
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 380px;
      height: 550px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    .vet-chatbot-container.open {
      display: flex;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .vet-chatbot-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .vet-chatbot-avatar {
      width: 45px;
      height: 45px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .vet-chatbot-title {
      flex: 1;
    }

    .vet-chatbot-title h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .vet-chatbot-title p {
      margin: 4px 0 0;
      font-size: 12px;
      opacity: 0.9;
    }

    .vet-chatbot-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 5px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .vet-chatbot-close:hover {
      opacity: 1;
    }

    .vet-chatbot-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8f9fa;
    }

    .vet-chatbot-message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.5;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .vet-chatbot-message.bot {
      background: white;
      color: #333;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .vet-chatbot-message.user {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 4px;
      align-self: flex-end;
    }

    .vet-chatbot-message.error {
      background: #fee;
      color: #c00;
      border: 1px solid #fcc;
    }

    .vet-chatbot-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: white;
      border-radius: 18px;
      align-self: flex-start;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .vet-chatbot-typing span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out;
    }

    .vet-chatbot-typing span:nth-child(1) { animation-delay: -0.32s; }
    .vet-chatbot-typing span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .vet-chatbot-input-container {
      padding: 15px 20px;
      background: white;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
    }

    .vet-chatbot-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .vet-chatbot-input:focus {
      border-color: #667eea;
    }

    .vet-chatbot-send {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, opacity 0.2s;
    }

    .vet-chatbot-send:hover:not(:disabled) {
      transform: scale(1.05);
    }

    .vet-chatbot-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .vet-chatbot-send svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .vet-chatbot-container {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 70px;
        right: 0;
        left: 20px;
      }
    }
  `;

  // Create and inject styles
  function injectStyles() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = CONFIG.WIDGET_ID;
    widget.innerHTML = `
      <button class="vet-chatbot-button" aria-label="Open chat">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.03 4.39L2 22l5.61-1.03C9.04 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-2 13H8v-2h2v2zm0-3H8V8h2v4zm3 3h-2v-2h2v2zm0-3h-2V8h2v4zm3 3h-2v-2h2v2zm0-3h-2V8h2v4z"/>
        </svg>
      </button>
      <div class="vet-chatbot-container">
        <div class="vet-chatbot-header">
          <div class="vet-chatbot-avatar">🐾</div>
          <div class="vet-chatbot-title">
            <h3>Vet Assistant</h3>
            <p>Ask me about pet care!</p>
          </div>
          <button class="vet-chatbot-close" aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <div class="vet-chatbot-messages" id="vet-chatbot-messages"></div>
        <div class="vet-chatbot-input-container">
          <input 
            type="text" 
            class="vet-chatbot-input" 
            placeholder="Type your message..." 
            aria-label="Message input"
          />
          <button class="vet-chatbot-send" aria-label="Send message">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
    return widget;
  }

  // Add message to chat
  function addMessage(content, type = 'bot') {
    const messagesContainer = document.getElementById('vet-chatbot-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `vet-chatbot-message ${type}`;
    messageEl.textContent = content;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById('vet-chatbot-messages');
    const typingEl = document.createElement('div');
    typingEl.className = 'vet-chatbot-typing';
    typingEl.id = 'vet-chatbot-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typingEl = document.getElementById('vet-chatbot-typing');
    if (typingEl) typingEl.remove();
  }

  // Send message to API
  async function sendMessage(message) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId: getSessionId(),
          context: {
            userId: userConfig.userId,
            userName: userConfig.userName,
            petName: userConfig.petName,
            source: userConfig.source,
            customData: userConfig.customData,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data.response;
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chatbot API error:', error);
      throw error;
    }
  }

  // Initialize chat session
  async function initializeChat() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: getSessionId(),
          context: {
            userId: userConfig.userId,
            userName: userConfig.userName,
            petName: userConfig.petName,
            source: userConfig.source,
            customData: userConfig.customData,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addMessage(data.data.response, 'bot');
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      addMessage("Hello! 🐾 I'm your veterinary assistant. How can I help you today?", 'bot');
    }
  }

  // Load chat history
  async function loadHistory() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/chat/history/${getSessionId()}`);
      const data = await response.json();
      
      if (data.success && data.data.messages.length > 0) {
        data.data.messages.forEach(msg => {
          addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
        });
      } else {
        await initializeChat();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      await initializeChat();
    }
  }

  // Initialize widget
  function init() {
    // Inject styles
    injectStyles();

    // Create widget
    const widget = createWidget();

    // Get elements
    const toggleBtn = widget.querySelector('.vet-chatbot-button');
    const container = widget.querySelector('.vet-chatbot-container');
    const closeBtn = widget.querySelector('.vet-chatbot-close');
    const input = widget.querySelector('.vet-chatbot-input');
    const sendBtn = widget.querySelector('.vet-chatbot-send');

    let isOpen = false;
    let isInitialized = false;

    // Toggle chat
    function toggleChat() {
      isOpen = !isOpen;
      container.classList.toggle('open', isOpen);
      
      if (isOpen && !isInitialized) {
        isInitialized = true;
        loadHistory();
      }
      
      if (isOpen) {
        input.focus();
      }
    }

    // Handle send
    async function handleSend() {
      const message = input.value.trim();
      if (!message) return;

      // Clear input and disable button
      input.value = '';
      sendBtn.disabled = true;

      // Add user message
      addMessage(message, 'user');

      // Show typing indicator
      showTyping();

      try {
        const response = await sendMessage(message);
        hideTyping();
        addMessage(response, 'bot');
      } catch (error) {
        hideTyping();
        addMessage("Sorry, I couldn't process your request. Please try again.", 'error');
      }

      sendBtn.disabled = false;
      input.focus();
    }

    // Event listeners
    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    console.log('🐾 Vet Chatbot SDK initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
