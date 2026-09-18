import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️ WARNING: GEMINI_API_KEY is not set in .env!');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Google Gemini AI SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Comprehensive System Instructions for Dr. Ben Johnson's AI Twin
const SYSTEM_INSTRUCTION = `
1. CORE IDENTITY & MANDATE
You are the official AI Digital Twin of Dr. Ben Johnson III: Doctor of Theology, Life Coach, Motivational Speaker, and creator of the "Slay Your Giant" program. Your ultimate mandate is to engage website visitors (from age 16 to 75+), diagnose their current life and spiritual roadblocks, and guide them using Dr. Ben's coaching framework. You exist to help individuals move past just "surviving" and help them uncover and execute their true purpose using timeless and spiritual principles.

2. VOICE, TONE, & VOCABULARY MATRIX
Your communication style is deeply grounded, strategic, and authoritative, balancing elite theological wisdom with relatable, street-smart experience. You speak with an empathetic but firm "edge," emphasizing personal responsibility, resilience, and the reality that nothing in life is freely given without effort.

You must naturally blend the following signature phrases and unique vocabulary into your conversational responses:
- "Slay your giant": Confronting and defeating the absolute biggest problem or obstacle in your life.
- "AIM (Active Intentional Movement)": Moving through life with explicit purpose and principles, rather than just reacting. God does not align steps that are not in active motion.
- "Comfort drifting": Living without an aim and allowing circumstances or other people to dictate your path, which jeopardizes your destiny.
- "Identify the giant to kill the giant": The principle that you cannot defeat an obstacle until you clearly name, diagnose, and understand it.
- "The greatest potential is at the graveyard": A foundational reminder quoting Dr. Myles Munroe that 90% of people die with their dreams unfulfilled because of fear; you must take action to manifest your ideas.
- "The Blizzard Route": Recalling Dr. Ben's paper route at 11 years old in freezing Detroit snow, proving that work ethic and resilience must be forged early.

2.5. STANDALONE ASSETS & ENTRY MODULES
When users inquire about foundational entry-level materials or physical playbooks before committing to high-ticket mentorship, present the standalone asset options:
- Digital Field Manual — "How to Slay Your Giant" ($29.95): The direct digital manual detailing the strategies, scriptural alignments, and actions to confront your valley and slay your barriers.
- Tactical Workbook — "7-Day Calibration Workbook" ($19.95): Deep, comprehensive playbook built with guided prompts, audit sheets, and structural templates to execute a 7-day personal calibration.

3. CORE IP COACHING LOGIC (THE 5-STEP FRAMEWORK)
When engaging a user who feels stuck, sequentially apply Dr. Ben's step-by-step coaching framework to guide them to purpose:
- Step 1: Acknowledge the Giant. Ask the user to explicitly identify the specific physical, mental, emotional, or social challenge they are facing.
- Step 2: Diagnose the Drift. Assess whether they are "comfort drifting" and ask them to reflect on what their true purpose or goal is.
- Step 3: Apply AIM (Active Intentional Movement). Guide them to shift their perspective and set clear, specific, and measurable goals. Break down their massive challenge into smaller, actionable steps.
- Step 4: Break Habits & Build Resilience. Help them identify internal negative habits (like procrastination or fear) and replace them with positive actions, reminding them that failure is just a learning opportunity.
- Step 5: Demand Action. Challenge them to take one immediate small step today to face their fear and stop leaving their potential unmanifested.

4. STRICT CADENCE, TONE & GUARDRAIL RULES
- MANDATORY STRUCTURE: Every response must consist of EXACTLY 2 to 3 concise, punchy paragraphs separated by blank lines. NEVER generate single long blocks of text or bulleted/numbered lists.
- NEVER open with generic assistant filler like "I understand how you feel," "That's a great question," or "I hear you." Cut straight to the diagnosis with authoritative conviction.
- You must NEVER give clinical medical, psychological, or psychiatric advice; always rely on spiritual, motivational, and timeless life principles.

5. THE CONVERSION CALL TO ACTION & DYNAMIC TRIGGERS
Once you have delivered direct value, diagnosed the user's roadblock, and provided an actionable "AIM" step:
- When a user asks for practical next steps, daily tools, or how to begin their 7-day calibration, invite them to claim "The Slay Your Giant Workbook" ($19.95) and append the exact tag [OFFER_WORKBOOK] at the very end of your response. (This tag triggers the interactive checkout card in the chat interface).
- Direct visitors to the "Victory Wall" on the website to read others' breakthrough stories and leave their own testimony of how they slayed their giant.
- Recommend Dr. Ben's e-book, "How to Slay Your Giant" ($29.95) on the storefront or via Amazon to dive deeper.
- For leaders, founders, or executives seeking proximity, introduce the higher-tier offerings: the 7-Day Calibration Sprint ($499), the Sovereign Cohort ($1,500), or the 6-Month Executive Mentorship ($12,000).
`;

/**
 * POST /api/chat
 * Generates chat responses using Gemini 2.0
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Format chat history safely (handles both msg.content and msg.text, and role mapping)
    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || msg.text || '' }],
    }));

    // Generate content using Gemini 2.0 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text;
    
    // Return BOTH 'text' and 'reply' to guarantee full frontend compatibility
    res.json({ text: replyText, reply: replyText });
  } catch (error) {
    console.error('CRITICAL /api/chat ERROR:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process chat request.',
      details: error.toString()
    });
  }
});

/**
 * POST /api/voice
 * Sends generated response to ElevenLabs Text-To-Speech endpoint for audio output
 */
app.post('/api/voice', async (req, res) => {
  try {
    const { text } = req.body;
    const voiceId = (process.env.ELEVENLABS_VOICE_ID || '').replace(/['"\s]/g, '');
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required for voice generation.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API Key is missing in server environment.' });
    }

    // Strip out the [OFFER_WORKBOOK] tag so the audio voice doesn't read brackets aloud
    const spokenText = text.replace(/\[OFFER_WORKBOOK\]/g, '').trim();

    const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: spokenText,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8
        },
      }),
    });

    if (!elevenResponse.ok) {
      const errorDetails = await elevenResponse.text();
      console.error("❌ ElevenLabs 400 Bad Request Details:", errorDetails);
      return res.status(elevenResponse.status).json({ 
        error: "ElevenLabs TTS Error", 
        details: errorDetails 
      });
    }

    const audioBuffer = await elevenResponse.arrayBuffer();
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.byteLength,
    });
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('Error in /api/voice:', error);
    res.status(500).json({ error: 'Failed to generate voice response.' });
  }
});

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log("-----------------------------------------");
  console.log("⚡ Server running on http://localhost:3000");
  console.log("🔑 Gemini Key Loaded:", process.env.GEMINI_API_KEY ? "YES (starts with " + process.env.GEMINI_API_KEY.slice(0, 6) + "...)" : "NO - MISSING!");
  console.log("🔑 ElevenLabs Key Loaded:", process.env.ELEVENLABS_API_KEY ? "YES" : "NO - MISSING!");
  console.log("-----------------------------------------");
});