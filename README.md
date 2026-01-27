# 🐾 Veterinary Chatbot SDK

An AI-powered, website-embeddable chatbot for veterinary Q&A and appointment booking. Built with Node.js, Express, MongoDB, and Google Gemini AI.

## 📌 Overview

This project provides a complete backend solution for a veterinary chatbot that can:
- Answer pet care and veterinary-related questions using AI
- Book veterinary appointments through a conversational flow
- Be embedded into any website with a single script tag
- Persist conversations and appointments in MongoDB

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Website                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Chatbot SDK (chatbot.js)               │   │
│  │  - Floating widget UI                               │   │
│  │  - Session management                               │   │
│  │  - API communication                                │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐   │
│  │  Controllers │  │   Services   │  │    Models      │   │
│  │  - Chat      │  │  - AI        │  │  - Conversation│   │
│  │  - Appoint.  │  │  - Chat      │  │  - Appointment │   │
│  │              │  │  - Booking   │  │                │   │
│  └──────────────┘  └──────────────┘  └────────────────┘   │
│         │                 │                  │             │
│         └────────────────┬┘                  │             │
│                          ▼                   ▼             │
│         ┌─────────────────────────────────────────────┐   │
│         │              External Services              │   │
│         │  - Google Gemini AI   - MongoDB             │   │
│         └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Project Structure

```
├── src/
│   ├── config/           # Configuration files
│   │   ├── constants.js  # App constants & messages
│   │   ├── database.js   # MongoDB connection
│   │   └── gemini.js     # Google Gemini AI setup
│   │
│   ├── controllers/      # HTTP request handlers
│   │   ├── chatController.js
│   │   └── appointmentController.js
│   │
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   └── validateSession.js
│   │
│   ├── models/           # MongoDB schemas
│   │   ├── Conversation.js
│   │   └── Appointment.js
│   │
│   ├── routes/           # API route definitions
│   │   ├── chatRoutes.js
│   │   └── appointmentRoutes.js
│   │
│   ├── services/         # Business logic layer
│   │   ├── aiService.js      # Gemini AI integration
│   │   ├── chatService.js    # Chat orchestration
│   │   ├── conversationService.js
│   │   └── appointmentService.js
│   │
│   └── utils/            # Helper utilities
│       ├── responseHelper.js
│       └── validators.js
│
├── public/               # Static files
│   ├── chatbot.js        # Embeddable SDK script
│   └── index.html        # Demo page
│
├── .env.example          # Environment template
├── index.js              # Application entry point
├── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vanshguptaji/KOKO_Backend.git
   cd KOKO_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/vet_chatbot
   GEMINI_API_KEY=your_gemini_api_key_here
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. **Get a Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

6. **Run the server**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   - API: http://localhost:3000/
   - Demo: http://localhost:3000/index.html
   - SDK: http://localhost:3000/chatbot.js

## 📦 SDK Integration

### Basic Integration

Add the chatbot to any website with a single script tag:

```html
<script src="https://your-domain.com/chatbot.js"></script>
```

### With Configuration

Pass contextual information to the chatbot:

```html
<script>
  window.VetChatbotConfig = {
    userId: "user_123",
    userName: "John Doe",
    petName: "Buddy",
    source: "marketing-website",
    apiUrl: "https://your-backend-domain.com" // Optional: custom API URL
  };
</script>
<script src="https://your-domain.com/chatbot.js"></script>
```

## 📡 API Endpoints

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/init` | Initialize a new chat session |
| POST | `/api/chat/message` | Send a message and get AI response |
| GET | `/api/chat/history/:sessionId` | Get conversation history |
| DELETE | `/api/chat/session/:sessionId` | Reset session booking state |

### Appointment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List all appointments (paginated) |
| GET | `/api/appointments/stats` | Get appointment statistics |
| GET | `/api/appointments/:id` | Get appointment by ID |
| GET | `/api/appointments/session/:sessionId` | Get appointments by session |
| PATCH | `/api/appointments/:id/status` | Update appointment status |

### Example API Requests

**Send a message:**
```bash
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What vaccines does my puppy need?",
    "sessionId": "session_123"
  }'
```

**Initialize session:**
```bash
curl -X POST http://localhost:3000/api/chat/init \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "userName": "John",
      "petName": "Max"
    }
  }'
```

## 🤖 AI Behavior

The chatbot uses Google Gemini AI with a specialized system prompt that:

1. **Only answers veterinary topics:**
   - Pet care and wellness
   - Vaccination schedules
   - Diet and nutrition
   - Common illnesses
   - Preventive care

2. **Detects appointment intent:**
   - Recognizes phrases like "book appointment", "schedule visit"
   - Automatically enters booking flow

3. **Politely declines non-veterinary questions:**
   - Redirects users to pet-related topics

## 📅 Appointment Booking Flow

The conversational booking flow collects:

1. **Pet Owner Name** - Validated (2-100 characters)
2. **Pet Name** - Required
3. **Phone Number** - Validated format
4. **Preferred Date & Time** - Free text

Users confirm details before the appointment is saved.

## 🔐 Security Features

- **Helmet.js** - Security headers
- **CORS** - Configurable origins
- **Rate Limiting** - 100 requests per 15 minutes
- **Input Validation** - All inputs sanitized
- **Error Handling** - Centralized error management

## 🎯 Key Design Decisions

### 1. Service Layer Pattern
Business logic is separated from controllers, making it:
- Easier to test
- More maintainable
- Reusable across different entry points

### 2. Session-Based Conversations
- Sessions persist across page reloads
- No authentication required for basic usage
- Optional user context can be passed

### 3. Stateful Booking Flow
- Booking state stored in conversation document
- Allows resuming interrupted bookings
- Clean state machine implementation

### 4. Embeddable SDK
- Self-contained JavaScript file
- No dependencies required
- Customizable via configuration object
- Works on any website

## 🔮 Future Improvements

1. **Authentication** - Admin dashboard with auth
2. **Real-time Updates** - WebSocket for live chat
3. **Email Notifications** - Appointment confirmations
4. **Multi-language Support** - i18n integration
5. **Analytics Dashboard** - Usage metrics
6. **Appointment Reminders** - Scheduled notifications
7. **File Uploads** - Pet photos/documents
8. **Voice Input** - Speech-to-text integration

## 📝 Assumptions

1. Single timezone for appointments (can be enhanced)
2. Basic phone validation (international formats supported)
3. No payment processing (can be integrated)
4. Admin endpoints are unprotected (add auth for production)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Manual testing
# 1. Start the server: npm run dev
# 2. Open http://localhost:3000/index.html
# 3. Test the chatbot widget
```

## 🐳 Docker Setup (Optional)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/vet_chatbot
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mongo
  
  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 📄 License

ISC License

## 👤 Author

Vansh Gupta

---

Built with ❤️ for pets everywhere 🐾
