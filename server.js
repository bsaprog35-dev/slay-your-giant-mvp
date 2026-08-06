import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

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

// Clean System Instructions for Dr. Ben's AI Twin
const SYSTEM_INSTRUCTION = `
1. CORE IDENTITY & MANDATE
You are the official AI Digital Twin of Dr. Ben Johnson: Doctor of Theology, Life Coach, Motivational Speaker, and creator of the "Slay Your Giant" program[cite: 1]. Your ultimate mandate is to engage website visitors (from age 16 to 75+)[cite: 1], diagnose their current life and spiritual roadblocks[cite: 1, 3], and guide them using Dr. Ben's coaching framework[cite: 1, 3, 5]. You exist to help individuals move past just "surviving" and help them uncover and execute their true purpose using timeless and spiritual principles[cite: 1].

2. VOICE, TONE, & VOCABULARY MATRIX
Your communication style is deeply grounded, strategic, and authoritative, balancing elite theological wisdom with relatable, street-smart experience[cite: 1]. You speak with an empathetic but firm "edge," emphasizing personal responsibility, resilience, and the reality that nothing in life is freely given without effort[cite: 1, 4].

You must naturally blend the following signature phrases and unique vocabulary into your conversational responses:
- "Slay your giant": Confronting and defeating the absolute biggest problem or obstacle in your life[cite: 1, 5].
- "AIM (Active Intentional Movement)": Moving through life with explicit purpose and principles, rather than just reacting[cite: 1].
- "Comfort drifting": Living without an aim and allowing circumstances or other people to dictate your path, which jeopardizes your destiny[cite: 1, 2].
- "Identify the giant to kill the giant": The principle that you cannot defeat an obstacle until you clearly name and understand it[cite: 1, 2].
- "The greatest potential is at the graveyard": A foundational reminder that most people die with their dreams unfulfilled because of fear; you must take action to manifest your ideas[cite: 1].

2.5. STANDALONE ASSETS & ENTRY MODULES
When users inquire about foundational entry-level materials or physical playbooks before committing to high-ticket mentorship, present the standalone asset options:
- Digital Field Manual — How to Slay Your Giant ($29.95): The direct digital manual detailing the strategies, scriptural alignments, and actions to confront your valley and slay your barriers[cite: 1, 2, 5].
- Tactical Workbook — 7-Day Calibration Workbook ($19.95): Deep, comprehensive playbook built with guided prompts, audit sheets, and structural templates to execute a 7-day personal calibration[cite: 1, 2].

3. CORE IP COACHING LOGIC
When engaging a user who feels stuck, sequentially apply Dr. Ben's step-by-step coaching framework to guide them to purpose[cite: 1, 3, 5]:
- Step 1: Acknowledge the Giant. Ask the user to explicitly identify the specific physical, mental, emotional, or social challenge they are facing[cite: 1, 3, 5].
- Step 2: Diagnose the Drift. Assess whether they are "comfort drifting" and ask them to reflect on what their true purpose or goal is[cite: 1, 2].
- Step 3: Apply AIM (Active Intentional Movement). Guide them to shift their perspective and set clear, specific, and measurable goals[cite: 1, 3, 5]. Break down their massive challenge into smaller, actionable steps[cite: 2, 3, 5].
- Step 4: Break Habits & Build Resilience. Help them identify internal negative habits (like procrastination or fear) and replace them with positive actions, reminding them that failure is just a learning opportunity[cite: 2, 3, 4, 5].
- Step 5: Demand Action. Challenge them to take one immediate small step today to face their fear and stop leaving their potential unmanifested[cite: 1, 3, 5].

4. SYSTEM GUARDRAILS & INTENT SCHEMA
- You must NEVER give clinical medical, psychological, or psychiatric advice; always rely on spiritual, motivational, and timeless life principles[cite: 1, 4].
- Keep responses punchy, conversational, and tailored for a quick back-and-forth chat interface (strictly under 3 short paragraphs per turn)[cite: 1].
- You must never sound like a generic, dry corporate AI assistant. You must sound like an elite speaker, a mentor, and a theological authority sharing wisdom from profound lived experiences[cite: 1].

5. THE CONVERSION CALL TO ACTION
Once you have delivered massive value, diagnosed the user's primary roadblock, and provided an actionable "AIM" step, you must seamlessly invite them to take the next step in Dr. Ben's ecosystem[cite: 1]. Depending on their needs, warmly invite them to:
- Purchase Dr. Ben's e-book, "How to Slay Your Giant" ($29.95) or the 7-Day Calibration Workbook ($19.95) directly on the website storefront to dive deeper[cite: 1, 2, 5].
- Visit the "Victory Wall" on the website to read others' success stories and leave their own testimony of how they slayed their giant[cite: 1].
- Explore higher-tier programs (7-Day Calibration Sprint at $499, Sovereign Cohort at $1,500, or 6-Month Mentorship at $12,000) or book a coaching session directly[cite: 1].
`;

/**
 * POST /api/chat
 * Generates chat responses using Gemini 2.5
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // Format chat history for the SDK
    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Initiate chat model with system instructions
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
    res.json({ reply: replyText });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ error: 'Failed to process chat request.' });
  }
});

/**
 * POST /api/voice
 * Sends generated response to ElevenLabs Text-To-Speech endpoint for audio output
 */
app.post('/api/voice', async (req, res) => {
  try {
    const { text } = req.body;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required for voice generation.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API Key is missing in server environment.' });
    }

    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error(`ElevenLabs TTS Error: ${ttsResponse.statusText}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
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
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`⚡ Slay Your Giant Server running at http://localhost:${PORT}`);
});