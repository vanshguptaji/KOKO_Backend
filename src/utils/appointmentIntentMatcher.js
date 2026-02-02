/**
 * Appointment Intent Matcher
 * Comprehensive keyword and phrase matching for appointment booking intents
 */

/**
 * Primary booking keywords - exact matches
 */
const PRIMARY_BOOKING_KEYWORDS = [
  'book',
  'booking',
  'schedule',
  'scheduling',
  'appointment',
  'appointments',
  'reserve',
  'reservation',
  'slot',
  'visit',
  'consultation',
  'checkup',
  'check-up',
  'check up',
];

/**
 * Action verbs that indicate booking intent
 */
const BOOKING_ACTION_VERBS = [
  'book',
  'make',
  'create',
  'set',
  'setup',
  'set up',
  'schedule',
  'arrange',
  'plan',
  'fix',
  'reserve',
  'get',
  'need',
  'want',
  'would like',
  'looking for',
  'looking to',
  'interested in',
  'request',
  'requesting',
];

/**
 * Appointment-related nouns
 */
const APPOINTMENT_NOUNS = [
  'appointment',
  'appointments',
  'booking',
  'bookings',
  'reservation',
  'reservations',
  'slot',
  'slots',
  'time',
  'timeslot',
  'time slot',
  'visit',
  'visits',
  'session',
  'sessions',
  'consultation',
  'consultations',
  'meeting',
  'checkup',
  'check-up',
  'check up',
  'examination',
  'exam',
];

/**
 * Pet-related keywords that strengthen booking intent
 */
const PET_CONTEXT_KEYWORDS = [
  'pet',
  'pets',
  'dog',
  'dogs',
  'puppy',
  'puppies',
  'cat',
  'cats',
  'kitten',
  'kittens',
  'bird',
  'birds',
  'rabbit',
  'rabbits',
  'bunny',
  'bunnies',
  'hamster',
  'hamsters',
  'guinea pig',
  'fish',
  'turtle',
  'reptile',
  'animal',
  'animals',
  'furry friend',
  'fur baby',
  'furbaby',
];

/**
 * Veterinary/clinic context keywords
 */
const VET_CONTEXT_KEYWORDS = [
  'vet',
  'vets',
  'veterinary',
  'veterinarian',
  'clinic',
  'hospital',
  'doctor',
  'dr',
  'koko',
  'grooming',
  'vaccination',
  'vaccine',
  'shots',
  'treatment',
  'surgery',
  'spay',
  'neuter',
  'dental',
  'wellness',
  'annual',
  'routine',
];

/**
 * Time-related keywords that indicate scheduling intent
 */
const TIME_CONTEXT_KEYWORDS = [
  'today',
  'tomorrow',
  'next week',
  'this week',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'morning',
  'afternoon',
  'evening',
  'asap',
  'soon',
  'earliest',
  'available',
  'availability',
  'when',
  'date',
  'time',
  'am',
  'pm',
];

/**
 * Common booking phrases (full and partial matches)
 */
const BOOKING_PHRASES = [
  // Direct booking requests
  'book an appointment',
  'book appointment',
  'book a slot',
  'book slot',
  'make an appointment',
  'make appointment',
  'schedule an appointment',
  'schedule appointment',
  'schedule a visit',
  'get an appointment',
  'set up an appointment',
  'set up appointment',
  'setup appointment',
  'reserve a slot',
  'reserve slot',
  'fix an appointment',
  
  // Need/Want expressions
  'need an appointment',
  'need appointment',
  'need to book',
  'need to schedule',
  'want an appointment',
  'want to book',
  'want to schedule',
  'would like an appointment',
  'would like to book',
  'would like to schedule',
  'looking to book',
  'looking to schedule',
  'looking for an appointment',
  'interested in booking',
  
  // Question forms
  'can i book',
  'can i schedule',
  'can i make an appointment',
  'can i get an appointment',
  'how do i book',
  'how to book',
  'how can i book',
  'how can i schedule',
  'how to schedule',
  'how do i schedule',
  'is there availability',
  'are there any slots',
  'any available slots',
  'any openings',
  'any availability',
  'when can i come',
  'when can i bring',
  'when is the next available',
  'what times are available',
  'what slots are available',
  'do you have availability',
  'do you have any openings',
  
  // Urgent/immediate requests
  'need to see the vet',
  'need to see a vet',
  'bring my pet',
  'bring my dog',
  'bring my cat',
  'take my pet',
  'take my dog',
  'take my cat',
  'pet needs to see',
  'dog needs to see',
  'cat needs to see',
  'get my pet checked',
  'get my dog checked',
  'get my cat checked',
  
  // Service-specific booking
  'book a checkup',
  'book checkup',
  'schedule a checkup',
  'schedule checkup',
  'book vaccination',
  'schedule vaccination',
  'book grooming',
  'schedule grooming',
  'book a consultation',
  'schedule consultation',
  'book an exam',
  'schedule an exam',
  'wellness visit',
  'routine checkup',
  'annual checkup',
  'annual visit',
  
  // Informal/casual expressions
  'come in',
  'drop by',
  'stop by',
  'visit the clinic',
  'visit the vet',
  'see the doctor',
  'see the vet',
  'come for a visit',
  'arrange a visit',
  'plan a visit',
  
  // Rescheduling (also booking intent)
  'reschedule',
  'reschedule appointment',
  'change appointment',
  'change my appointment',
  'move my appointment',
  'modify appointment',
  'update appointment',
  'new appointment',
  'another appointment',
  'different time',
  'different date',
];

/**
 * Misspellings and typos to catch
 */
const COMMON_MISSPELLINGS = {
  // Appointment variations
  'apointment': 'appointment',
  'appointement': 'appointment',
  'appoinment': 'appointment',
  'appoitment': 'appointment',
  'appt': 'appointment',
  'apt': 'appointment',
  'appointmnt': 'appointment',
  'appointmnet': 'appointment',
  'appoitnemnt': 'appointment',
  'appintment': 'appointment',
  'apponiment': 'appointment',
  'appointmemt': 'appointment',
  'appointmet': 'appointment',
  'appointent': 'appointment',
  'appotinment': 'appointment',
  
  // Book variations
  'bok': 'book',
  'boook': 'book',
  'bokk': 'book',
  'buk': 'book',
  'boook': 'book',
  'boo': 'book',
  
  // Schedule variations
  'scedule': 'schedule',
  'scehdule': 'schedule',
  'schedle': 'schedule',
  'schdule': 'schedule',
  'shedule': 'schedule',
  'schedual': 'schedule',
  'shcedule': 'schedule',
  'schedulle': 'schedule',
  'schecule': 'schedule',
  'schedlue': 'schedule',
  
  // Reservation variations
  'reservaton': 'reservation',
  'reervation': 'reservation',
  'reservtion': 'reservation',
  'resevation': 'reservation',
  'reservaion': 'reservation',
  
  // Slot variations
  'slott': 'slot',
  'slote': 'slot',
  'solt': 'slot',
  
  // Vet variations
  'vetenary': 'veterinary',
  'veternary': 'veterinary',
  'vetinary': 'veterinary',
  'veternarian': 'veterinarian',
  'vetrinarian': 'veterinarian',
  'vetirnarian': 'veterinarian',
  
  // Checkup variations
  'chekup': 'checkup',
  'checkp': 'checkup',
  'chekc up': 'checkup',
  'chekcup': 'checkup',
  'ceckup': 'checkup',
  'chekup': 'checkup',
  
  // Consultation variations
  'consulation': 'consultation',
  'consulatation': 'consultation',
  'consultion': 'consultation',
  'consultaion': 'consultation',
  'cosultation': 'consultation',
  
  // Vaccination variations
  'vacination': 'vaccination',
  'vaccinaion': 'vaccination',
  'vaccnation': 'vaccination',
  'vaccinaton': 'vaccination',
  'vaxination': 'vaccination',
  'vacine': 'vaccine',
  'vaccin': 'vaccine',
  
  // Grooming variations
  'groming': 'grooming',
  'groomin': 'grooming',
  'grooming': 'grooming',
  'grroming': 'grooming',
  
  // Tomorrow variations
  'tommorow': 'tomorrow',
  'tommorrow': 'tomorrow',
  'tomorow': 'tomorrow',
  'tomorro': 'tomorrow',
  'tomoroow': 'tomorrow',
  
  // Available variations
  'availble': 'available',
  'avialable': 'available',
  'avaialble': 'available',
  'availabel': 'available',
  'avaliable': 'available',
};

/**
 * Abbreviations to expand
 */
const ABBREVIATIONS = {
  'appt': 'appointment',
  'apt': 'appointment',
  'sched': 'schedule',
  'resv': 'reservation',
  'vet': 'veterinary',
  'doc': 'doctor',
  'dr': 'doctor',
  'avail': 'available',
  'tmrw': 'tomorrow',
  'tmr': 'tomorrow',
  'tomo': 'tomorrow',
  'tom': 'tomorrow',
  'nxt': 'next',
  'wk': 'week',
  'mon': 'monday',
  'tue': 'tuesday',
  'tues': 'tuesday',
  'wed': 'wednesday',
  'thu': 'thursday',
  'thurs': 'thursday',
  'fri': 'friday',
  'sat': 'saturday',
  'sun': 'sunday',
  'morn': 'morning',
  'aft': 'afternoon',
  'eve': 'evening',
  'pls': 'please',
  'plz': 'please',
  'u': 'you',
  'ur': 'your',
  'asap': 'as soon as possible',
  'b4': 'before',
  'w/': 'with',
  'abt': 'about',
  'thx': 'thanks',
  'ty': 'thank you',
  'ppl': 'people',
  'msg': 'message',
  'info': 'information',
  'mins': 'minutes',
  'hrs': 'hours',
};

/**
 * Normalize text for matching
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  let normalized = text.toLowerCase().trim();
  
  // Replace multiple spaces with single space
  normalized = normalized.replace(/\s+/g, ' ');
  
  // Remove punctuation except hyphens in compound words
  normalized = normalized.replace(/[^\w\s\-']/g, ' ');
  
  // Normalize spaces again after punctuation removal
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Fix common misspellings in text
 */
function fixMisspellings(text) {
  let fixed = text;
  
  for (const [misspelled, correct] of Object.entries(COMMON_MISSPELLINGS)) {
    const regex = new RegExp(`\\b${misspelled}\\b`, 'gi');
    fixed = fixed.replace(regex, correct);
  }
  
  return fixed;
}

/**
 * Expand abbreviations in text
 */
function expandAbbreviations(text) {
  let expanded = text;
  
  for (const [abbrev, full] of Object.entries(ABBREVIATIONS)) {
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    expanded = expanded.replace(regex, full);
  }
  
  return expanded;
}

/**
 * Calculate intent score based on keyword matches
 */
function calculateIntentScore(text) {
  const normalized = normalizeText(text);
  const corrected = fixMisspellings(expandAbbreviations(normalized));
  
  let score = 0;
  const matches = {
    primaryKeywords: [],
    actionVerbs: [],
    appointmentNouns: [],
    petContext: [],
    vetContext: [],
    timeContext: [],
    phrases: [],
  };

  // Check for exact phrase matches (highest weight)
  for (const phrase of BOOKING_PHRASES) {
    if (corrected.includes(phrase.toLowerCase())) {
      score += 50;
      matches.phrases.push(phrase);
    }
  }

  // Check primary booking keywords (high weight)
  for (const keyword of PRIMARY_BOOKING_KEYWORDS) {
    if (corrected.includes(keyword)) {
      score += 20;
      matches.primaryKeywords.push(keyword);
    }
  }

  // Check action verbs (medium-high weight)
  for (const verb of BOOKING_ACTION_VERBS) {
    if (corrected.includes(verb)) {
      score += 15;
      matches.actionVerbs.push(verb);
    }
  }

  // Check appointment nouns (medium weight)
  for (const noun of APPOINTMENT_NOUNS) {
    if (corrected.includes(noun)) {
      score += 10;
      matches.appointmentNouns.push(noun);
    }
  }

  // Check pet context (bonus weight)
  for (const keyword of PET_CONTEXT_KEYWORDS) {
    if (corrected.includes(keyword)) {
      score += 5;
      matches.petContext.push(keyword);
    }
  }

  // Check vet context (bonus weight)
  for (const keyword of VET_CONTEXT_KEYWORDS) {
    if (corrected.includes(keyword)) {
      score += 5;
      matches.vetContext.push(keyword);
    }
  }

  // Check time context (bonus weight)
  for (const keyword of TIME_CONTEXT_KEYWORDS) {
    if (corrected.includes(keyword)) {
      score += 3;
      matches.timeContext.push(keyword);
    }
  }

  // Combination bonuses
  if (matches.actionVerbs.length > 0 && matches.appointmentNouns.length > 0) {
    score += 25; // Verb + noun combo (e.g., "book appointment")
  }
  
  if (matches.petContext.length > 0 && (matches.vetContext.length > 0 || matches.appointmentNouns.length > 0)) {
    score += 15; // Pet + vet/appointment context
  }

  if (matches.timeContext.length > 0 && matches.appointmentNouns.length > 0) {
    score += 10; // Time + appointment context
  }

  return { score, matches, normalizedText: corrected };
}

/**
 * Determine if the input is a booking intent
 */
function isBookingIntent(text, threshold = 25) {
  const { score, matches, normalizedText } = calculateIntentScore(text);
  
  return {
    isBooking: score >= threshold,
    confidence: Math.min(score / 100, 1), // Normalize to 0-1
    score,
    matches,
    normalizedText,
  };
}

/**
 * Extract booking details from text (basic extraction)
 */
function extractBookingDetails(text) {
  const normalized = normalizeText(text);
  const corrected = fixMisspellings(expandAbbreviations(normalized));
  
  const details = {
    hasDate: false,
    hasTime: false,
    hasPetType: false,
    hasService: false,
    extractedTokens: {
      dates: [],
      times: [],
      petTypes: [],
      services: [],
    },
  };

  // Check for pet types
  const petTypes = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'fish', 'turtle', 'reptile', 'puppy', 'kitten', 'bunny'];
  for (const pet of petTypes) {
    if (corrected.includes(pet)) {
      details.hasPetType = true;
      details.extractedTokens.petTypes.push(pet);
    }
  }

  // Check for day references
  const days = ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 
                'next week', 'this week', 'next monday', 'next tuesday', 'next wednesday', 'next thursday', 'next friday'];
  for (const day of days) {
    if (corrected.includes(day)) {
      details.hasDate = true;
      details.extractedTokens.dates.push(day);
    }
  }

  // Check for time references
  const timePatterns = [
    /\b(\d{1,2})\s*(am|pm)\b/gi,
    /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/gi,
    /\b(morning|afternoon|evening|noon|night)\b/gi,
  ];
  
  for (const pattern of timePatterns) {
    const timeMatches = corrected.match(pattern);
    if (timeMatches) {
      details.hasTime = true;
      details.extractedTokens.times.push(...timeMatches);
    }
  }

  // Check for service types
  const services = ['checkup', 'check-up', 'vaccination', 'vaccine', 'grooming', 'dental', 'surgery', 
                    'consultation', 'wellness', 'examination', 'exam', 'shots', 'spay', 'neuter', 'treatment'];
  for (const service of services) {
    if (corrected.includes(service)) {
      details.hasService = true;
      details.extractedTokens.services.push(service);
    }
  }

  return details;
}

/**
 * Get all booking-related keywords for indexing/search
 */
function getAllBookingKeywords() {
  return {
    primaryKeywords: PRIMARY_BOOKING_KEYWORDS,
    actionVerbs: BOOKING_ACTION_VERBS,
    appointmentNouns: APPOINTMENT_NOUNS,
    petContext: PET_CONTEXT_KEYWORDS,
    vetContext: VET_CONTEXT_KEYWORDS,
    timeContext: TIME_CONTEXT_KEYWORDS,
    phrases: BOOKING_PHRASES,
    misspellings: Object.keys(COMMON_MISSPELLINGS),
    abbreviations: Object.keys(ABBREVIATIONS),
  };
}

/**
 * Quick check if text contains any booking-related keywords
 * Faster than full intent scoring for initial filtering
 */
function containsBookingKeyword(text) {
  const normalized = normalizeText(text);
  const corrected = fixMisspellings(expandAbbreviations(normalized));
  
  // Quick check for most common booking words
  const quickKeywords = [
    'book', 'appointment', 'schedule', 'reserve', 'slot', 'visit',
    'checkup', 'consultation', 'vet', 'doctor', 'clinic'
  ];
  
  for (const keyword of quickKeywords) {
    if (corrected.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get suggested response based on detected intent
 */
function getSuggestedPrompt(intentResult) {
  if (!intentResult.isBooking) {
    return null;
  }
  
  const { matches } = intentResult;
  
  // If they mentioned a pet type
  if (matches.petContext.length > 0) {
    const pet = matches.petContext[0];
    return `I'd be happy to help you book an appointment for your ${pet}! What date and time works best for you?`;
  }
  
  // If they mentioned a service
  if (matches.vetContext.includes('grooming')) {
    return "I can help you schedule a grooming appointment! When would you like to bring your pet in?";
  }
  
  if (matches.vetContext.includes('vaccination') || matches.vetContext.includes('vaccine')) {
    return "I can help you schedule a vaccination appointment! What date and time works for you?";
  }
  
  // If they mentioned a time
  if (matches.timeContext.length > 0) {
    return "Great! Let me check availability for that time. Can you also tell me your pet's name and what service you need?";
  }
  
  // Generic booking response
  return "I'd be happy to help you book an appointment! Could you please tell me your pet's name, type, and your preferred date and time?";
}

/**
 * Test examples to verify coverage
 */
function runTestExamples() {
  const testCases = [
    // Should match (booking intent)
    { text: "I want to book an appointment for my dog", expected: true },
    { text: "Can I schedule a vet visit tomorrow?", expected: true },
    { text: "Need to make an appt for my cat", expected: true },
    { text: "book apointment please", expected: true },
    { text: "i wanna bring my puppy for a checkup", expected: true },
    { text: "when can I come in for vaccination", expected: true },
    { text: "any slots available this week?", expected: true },
    { text: "looking to schedule a consultation", expected: true },
    { text: "my pet needs to see the doctor", expected: true },
    { text: "can u help me book a slot for tmrw", expected: true },
    { text: "I'd like to arrange a visit for my rabbit", expected: true },
    { text: "do you have availability on monday morning", expected: true },
    { text: "need an appointment asap", expected: true },
    { text: "want to get my cat examined", expected: true },
    { text: "how do I reserve a time slot", expected: true },
    { text: "fix an appointment for grooming", expected: true },
    { text: "set up a wellness visit", expected: true },
    { text: "scedule a checkup for my dog", expected: true },
    { text: "is there an opening for today afternoon", expected: true },
    { text: "book me in for next friday", expected: true },
    { text: "i need to bring my kitten to the vet", expected: true },
    { text: "schedule an exam for my pet", expected: true },
    { text: "any time slots for tommorow?", expected: true },
    { text: "vacination appointment pls", expected: true },
    { text: "groming for my dog", expected: true },
    
    // Should NOT match (non-booking)
    { text: "what are your hours", expected: false },
    { text: "where is the clinic located", expected: false },
    { text: "how much does it cost", expected: false },
    { text: "cancel my appointment", expected: false },
    { text: "hello", expected: false },
    { text: "thank you", expected: false },
    { text: "what services do you offer", expected: false },
    { text: "goodbye", expected: false },
  ];

  console.log('Running booking intent test cases:\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = isBookingIntent(testCase.text);
    const success = result.isBooking === testCase.expected;
    
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    const status = success ? '✓' : '✗';
    console.log(`${status} "${testCase.text}"`);
    console.log(`  → Expected: ${testCase.expected}, Got: ${result.isBooking}, Score: ${result.score}`);
    if (!success) {
      console.log(`  → Matches: ${JSON.stringify(result.matches)}`);
    }
    console.log('');
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);
  
  return { passed, failed, total: testCases.length };
}

module.exports = {
  // Core functions
  normalizeText,
  fixMisspellings,
  expandAbbreviations,
  calculateIntentScore,
  isBookingIntent,
  extractBookingDetails,
  getAllBookingKeywords,
  containsBookingKeyword,
  getSuggestedPrompt,
  
  // Keyword lists (for external use/customization)
  PRIMARY_BOOKING_KEYWORDS,
  BOOKING_ACTION_VERBS,
  APPOINTMENT_NOUNS,
  PET_CONTEXT_KEYWORDS,
  VET_CONTEXT_KEYWORDS,
  TIME_CONTEXT_KEYWORDS,
  BOOKING_PHRASES,
  COMMON_MISSPELLINGS,
  ABBREVIATIONS,
  
  // Testing
  runTestExamples,
};
