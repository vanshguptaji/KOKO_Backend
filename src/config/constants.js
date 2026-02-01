/**
 * Application Constants
 * Centralized configuration constants
 */

module.exports = {
  // Appointment booking flow states
  BOOKING_STATES: {
    IDLE: 'idle',
    COLLECTING_OWNER_NAME: 'collecting_owner_name',
    COLLECTING_PET_NAME: 'collecting_pet_name',
    COLLECTING_PHONE: 'collecting_phone',
    COLLECTING_DATE_TIME: 'collecting_date_time',
    CONFIRMING: 'confirming',
    COMPLETED: 'completed',
  },

  // Message types
  MESSAGE_TYPES: {
    USER: 'user',
    BOT: 'bot',
    SYSTEM: 'system',
  },

  // Appointment status
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    NO_SHOW: 'no-show',
  },

  // Service types
  SERVICE_TYPES: {
    CHECKUP: 'checkup',
    VACCINATION: 'vaccination',
    GROOMING: 'grooming',
    DENTAL: 'dental',
    SURGERY: 'surgery',
    EMERGENCY: 'emergency',
    CONSULTATION: 'consultation',
    OTHER: 'other',
  },

  // Service details with duration
  SERVICES: [
    { id: 'checkup', name: 'General Checkup', duration: 30, description: 'Routine health examination' },
    { id: 'vaccination', name: 'Vaccination', duration: 20, description: 'Vaccines and immunizations' },
    { id: 'grooming', name: 'Grooming', duration: 60, description: 'Bath, haircut, nail trim' },
    { id: 'dental', name: 'Dental Care', duration: 45, description: 'Teeth cleaning and dental checkup' },
    { id: 'surgery', name: 'Surgery', duration: 120, description: 'Surgical procedures' },
    { id: 'emergency', name: 'Emergency', duration: 60, description: 'Urgent care' },
    { id: 'consultation', name: 'Consultation', duration: 30, description: 'General advice and consultation' },
    { id: 'other', name: 'Other', duration: 30, description: 'Other services' },
  ],

  // Pet types
  PET_TYPES: ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other'],

  // Time slots configuration
  TIME_SLOTS: {
    START_HOUR: 9,  // 9 AM
    END_HOUR: 18,   // 6 PM
    SLOT_DURATION: 30, // 30 minutes
    BREAK_START: 13, // 1 PM
    BREAK_END: 14,   // 2 PM
  },

  // Days of operation (0 = Sunday, 6 = Saturday)
  OPERATING_DAYS: [1, 2, 3, 4, 5, 6], // Monday to Saturday

  // Validation patterns
  VALIDATION: {
    PHONE_REGEX: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
  },

  // API Response messages
  MESSAGES: {
    WELCOME: "Hello! 🐾 I'm your veterinary assistant. I can help you with pet care questions or book a vet appointment. How can I help you today?",
    APPOINTMENT_START: "I'd be happy to help you book an appointment! Let me collect some information. What is the pet owner's name?",
    ASK_PET_NAME: "Great! And what is your pet's name?",
    ASK_PHONE: "Perfect! What phone number can we reach you at?",
    ASK_DATE_TIME: "Almost done! When would you like to schedule the appointment? (Please provide your preferred date and time, e.g., 'January 30, 2026 at 2:00 PM' or 'tomorrow at 3pm')",
    CONFIRM_BOOKING: (details) => `Please confirm your appointment details:\n\n👤 Owner: ${details.ownerName}\n🐾 Pet: ${details.petName}\n📞 Phone: ${details.phone}\n📅 Date/Time: ${details.preferredDateTime}\n\nReply "yes" to confirm or "no" to start over.`,
    BOOKING_SUCCESS: "✅ Your appointment has been booked successfully! You'll receive a confirmation soon. Is there anything else I can help you with?",
    BOOKING_CANCELLED: "No problem! The booking has been cancelled. Feel free to start over whenever you're ready. Is there anything else I can help with?",
    NON_VET_RESPONSE: "I apologize, but I can only help with veterinary and pet-related questions. Is there anything about your pet's health, care, or scheduling a vet appointment that I can assist you with?",
    ERROR_RESPONSE: "I'm sorry, I encountered an issue processing your request. Please try again or ask a different question.",
    INVALID_PHONE: "That doesn't look like a valid phone number. Please enter a valid phone number (e.g., +1234567890 or 123-456-7890).",
    INVALID_NAME: "Please enter a valid name (at least 2 characters).",
    DEFAULT_RESPONSE: "I'm here to help you with pet care questions and appointment booking. Would you like to:\n\n1. 📅 Book an appointment - just say 'book appointment'\n2. ❓ Ask a pet care question\n3. ℹ️ Get help - say 'help'\n\nWhat would you like to do?",
    HELP_MESSAGE: "Here's what I can help you with:\n\n📅 **Book an Appointment**\nSay 'book', 'appointment', or 'schedule' to start booking.\n\n🐾 **Pet Care Questions**\nAsk about vaccinations, diet, grooming, or general pet care.\n\n❌ **Cancel**\nSay 'cancel' or 'stop' to cancel the current action.\n\nHow can I assist you today?",
  },

  // Intent detection keywords for appointment booking
  APPOINTMENT_KEYWORDS: [
    'book',
    'appointment',
    'schedule',
    'visit',
    'see a vet',
    'see the vet',
    'see doctor',
    'see a doctor',
    'make an appointment',
    'book a vet',
    'vet appointment',
    'veterinary appointment',
    'checkup',
    'check up',
    'consultation',
    'reserve',
    'set up appointment',
    'arrange appointment',
  ],

  // Greeting keywords
  GREETING_KEYWORDS: [
    'hi',
    'hello',
    'hey',
    'hola',
    'good morning',
    'good afternoon',
    'good evening',
    'greetings',
    'howdy',
    'sup',
    'yo',
  ],

  // FAQ responses for common pet care questions
  FAQ_RESPONSES: [
    {
      keywords: ['vaccination', 'vaccine', 'vaccinate', 'shots', 'immunization'],
      response: "🐾 **Pet Vaccinations**\n\nVaccinations are essential for your pet's health! Here's what you should know:\n\n**For Dogs:**\n- Core vaccines: Rabies, Distemper, Parvovirus, Adenovirus\n- Usually start at 6-8 weeks old\n- Boosters needed annually\n\n**For Cats:**\n- Core vaccines: Rabies, Feline Distemper (FVRCP)\n- Usually start at 6-8 weeks old\n\nWould you like to book an appointment for vaccinations? Just say 'book appointment'!",
    },
    {
      keywords: ['diet', 'food', 'feed', 'eating', 'nutrition', 'hungry'],
      response: "🍽️ **Pet Diet & Nutrition**\n\n**General Tips:**\n- Feed age-appropriate food (puppy/kitten, adult, senior)\n- Measure portions to prevent obesity\n- Fresh water always available\n- Avoid: chocolate, grapes, onions, garlic\n\n**Feeding Schedule:**\n- Puppies: 3-4 times daily\n- Adult dogs: 2 times daily\n- Cats: 2-3 times daily\n\nIf you have concerns about your pet's diet, consider booking a consultation!",
    },
    {
      keywords: ['grooming', 'bath', 'brush', 'nail', 'fur', 'hair', 'shed'],
      response: "✨ **Pet Grooming Tips**\n\n**Regular Care:**\n- Brush regularly (daily for long-haired breeds)\n- Bath every 4-6 weeks or as needed\n- Trim nails every 2-4 weeks\n- Clean ears weekly\n- Brush teeth regularly\n\n**Watch For:**\n- Mats or tangles\n- Skin irritation\n- Excessive shedding\n\nNeed a grooming appointment? Say 'book appointment'!",
    },
    {
      keywords: ['sick', 'ill', 'symptom', 'vomit', 'diarrhea', 'not eating', 'lethargic'],
      response: "⚠️ **Pet Health Concerns**\n\n**Warning Signs to Watch For:**\n- Loss of appetite for more than 24 hours\n- Vomiting or diarrhea\n- Lethargy or weakness\n- Difficulty breathing\n- Excessive thirst or urination\n\n**Important:** If your pet shows severe symptoms, please seek immediate veterinary care.\n\nWould you like to book an appointment? Just say 'book appointment'!",
    },
    {
      keywords: ['flea', 'tick', 'parasite', 'worm', 'deworming'],
      response: "🐛 **Parasite Prevention**\n\n**Common Parasites:**\n- Fleas and ticks\n- Heartworms\n- Intestinal worms\n\n**Prevention Tips:**\n- Use monthly preventatives\n- Keep your yard clean\n- Regular vet check-ups\n- Wash bedding frequently\n\nNeed parasite prevention products or a check-up? Book an appointment!",
    },
    {
      keywords: ['training', 'behavior', 'obedience', 'bite', 'bark', 'aggressive'],
      response: "🎓 **Pet Training & Behavior**\n\n**Basic Tips:**\n- Start training early\n- Use positive reinforcement\n- Be consistent with commands\n- Keep training sessions short (5-10 minutes)\n- Socialize your pet early\n\n**Common Issues:**\n- Excessive barking - address underlying cause\n- Biting - redirect to appropriate toys\n- Anxiety - create a safe space\n\nFor behavioral concerns, a vet consultation can help rule out medical issues!",
    },
    {
      keywords: ['emergency', 'urgent', 'poison', 'accident', 'injury', 'bleeding'],
      response: "🚨 **Pet Emergency**\n\n**If this is an emergency, please contact your nearest emergency vet clinic immediately!**\n\n**Emergency Signs:**\n- Difficulty breathing\n- Severe bleeding\n- Suspected poisoning\n- Seizures\n- Inability to walk\n- Severe vomiting/diarrhea\n\n**First Aid Tips:**\n- Stay calm\n- Keep your pet warm and quiet\n- Don't give human medications\n- Transport safely to the vet\n\nFor non-emergency appointments, say 'book appointment'.",
    },
    {
      keywords: ['spay', 'neuter', 'sterilize', 'fix'],
      response: "✂️ **Spaying & Neutering**\n\n**Benefits:**\n- Prevents unwanted litters\n- Reduces risk of certain cancers\n- Can reduce behavioral issues\n- Helps pets live longer, healthier lives\n\n**When to Do It:**\n- Dogs: 6-9 months (varies by breed)\n- Cats: Around 4-6 months\n\nWould you like to schedule a consultation? Say 'book appointment'!",
    },
    {
      keywords: ['dental', 'teeth', 'breath', 'mouth'],
      response: "🦷 **Pet Dental Care**\n\n**Dental Health Tips:**\n- Brush teeth regularly (daily is ideal)\n- Use pet-safe toothpaste\n- Provide dental chews\n- Regular dental check-ups\n\n**Warning Signs:**\n- Bad breath\n- Red or swollen gums\n- Difficulty eating\n- Loose teeth\n\nDental problems can affect overall health. Book a dental check-up today!",
    },
    {
      keywords: ['hours', 'open', 'timing', 'when', 'available'],
      response: "🕐 **Our Hours**\n\nWe're here to help your pets!\n\n**Clinic Hours:**\n- Monday - Friday: 9:00 AM - 6:00 PM\n- Saturday: 9:00 AM - 2:00 PM\n- Sunday: Closed (Emergency only)\n\nWould you like to book an appointment? Just say 'book appointment'!",
    },
  ],
};

