const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static assets from the root workspace
app.use(express.static(__dirname));

// Google Gen AI SDK
let ai = null;
const isGeminiEnabled = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';

if (isGeminiEnabled) {
  try {
    const { GoogleGenAI } = require('@google/genai');
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Secure Gemini backend client initialized.");
  } catch (err) {
    console.error("Failed to load Google Gen AI SDK. Falling back to local simulation.", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Secure chat endpoint will run in simulation mode.");
}

// System instructions matrix based on Dr. Ben's Custom GPT
const SYSTEM_INSTRUCTION = `You are the AI Twin of Dr. Ben C. Johnson III. Operate strictly under Christian doctrine and utilize the AIM Activation Protocol (Alignment, Intention, Mindset). Speak with the tone of a relatable, authoritative, and powerful spiritual coach. Keep responses punchy, direct, and conversational so they sound natural when spoken out loud.

You MUST structure all responses according to the 5-step IP Coaching Logic:
1. ACKNOWLEDGE: Validate their struggle, reflecting their frustration back to them with deep empathy but strong authority.
2. DIAGNOSE: Call out the root spiritual/cognitive block (e.g. intellectualizing emotions as defense, comfort drifting, isolation disguised as pride).
3. APPLY AIM: Introduce Active Intentional Movement. Explain how alignment and intentional action break stagnancy.
4. BREAK HABITS: Expose the comfortable loops and passive habits they need to sever.
5. DEMAND ACTION: Command them to take one specific, concrete step right now, ending with a direct, challenging question.

CONVERSATIONAL INTENT CHECKOUT BRIDGE:
If the user's message indicates they are experiencing fear, comfort drifting, procrastination, career stagnation, or isolation (doing it alone), you MUST append the exact string "[OFFER_WORKBOOK]" (with brackets, all caps) to the very end of your response text. This tag triggers the frontend to dynamically display a checkout promotion card for your $45 Workbook.`;

// Secure Chat Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  console.log(`[Chat Proxy] Processing request: "${message.substring(0, 60)}..."`);

  // Detect key intents to verify if they match stuck/drift/fear
  const lowerMsg = message.toLowerCase();
  const matchedKeywords = ['stuck', 'drift', 'procrastinat', 'fear', 'alone', 'isolate', 'career', 'habit', 'lazy', 'comfort'];
  const hasIntent = matchedKeywords.some(keyword => lowerMsg.includes(keyword));

  if (isGeminiEnabled && ai) {
    try {
      // Map history to Google Gen AI format if supplied
      // Format: { role: 'user'|'model', parts: [{ text: '...' }] }
      let contents = [];
      if (history && Array.isArray(history)) {
        contents = history.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }));
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      let text = response.text || "";
      
      // Safety check: ensure intent tag is appended if the AI did not write it but the input clearly matches keywords
      if (hasIntent && !text.includes("[OFFER_WORKBOOK]")) {
        text += "\n\n[OFFER_WORKBOOK]";
      }

      return res.json({ text });
    } catch (err) {
      console.error("[Gemini API Error]", err);
      // Fall through to simulation if API call fails
    }
  }

  // Fallback Simulation Mode
  console.log("[Chat Proxy] Running in Simulation Mode.");
  await new Promise(resolve => setTimeout(resolve, 1200));

  let responseText = "";
  if (lowerMsg.includes('alone') || lowerMsg.includes('isolate') || lowerMsg.includes('carry')) {
    responseText = "Acknowledge: I hear you. Carrying the weight of your entire business or family on your own back is exhausting. \n\nDiagnose: But let's be honest—isolation is just pride in disguise. You've convinced yourself that no one can run it like you can, which keeps you trapped in the operations. \n\nApply AIM: True victory requires alignment. You must position your systems under Kingdom authority and delegate. Intention means building a framework that outlives you. \n\nBreak Habits: Break the habit of double-checking every task and trying to solve everything at midnight. \n\nDemand Action: Delegate one administrative responsibility to someone else tomorrow. Are you ready to let go of the control to gain your calling? [OFFER_WORKBOOK]";
  } else if (lowerMsg.includes('stuck') || lowerMsg.includes('drift') || lowerMsg.includes('procrastinat')) {
    responseText = "Acknowledge: You say you're busy but going nowhere. I see that frustration. It's a heavy place to be. \n\nDiagnose: You are suffering from comfort drift. You have traded your divine assignment for comfortable, low-risk routines. Procrastination is just fear of failure in disguise. \n\nApply AIM: Movement creates clarity. You don't find purpose sitting still or planning indefinitely. You move first, and God aligns your steps. \n\nBreak Habits: Sever the habit of endless brainstorming and planning without execution. \n\nDemand Action: Draft one single execution step and complete it within the next two hours. What is the one thing you are avoiding right now? [OFFER_WORKBOOK]";
  } else if (lowerMsg.includes('fear') || lowerMsg.includes('giant') || lowerMsg.includes('intimidat')) {
    responseText = "Acknowledge: Facing a giant that makes you feel small is terrifying. Your hesitation is real, but staying in the valley is a choice. \n\nDiagnose: Fear has built a legal fiction in your mind, convincing you that you have no authority. You're letting intimidation dictate your boundaries. \n\nApply AIM: Mindset is key. You put on the full armor of faith. The moment you stand firm, the giant's leverage is broken. Movement is your statement of authority. \n\nBreak Habits: Stop looking at the size of the obstacle and stop speaking defeat over your plans. \n\nDemand Action: Write down the absolute worst-case scenario, declare your faith over it, and make the phone call or write the email you've been avoiding. What giant are you giving permission to dictate your life? [OFFER_WORKBOOK]";
  } else {
    responseText = "Acknowledge: You've laid out your situation. I see where the friction is starting to pinch. \n\nDiagnose: The root issue is a lack of deep alignment. You are trying to strategize a path that hasn't been calibrated to your core purpose yet. \n\nApply AIM: Remember the baseline—Active Intentional Movement. Clarify your alignment, establish your strategic intention, and build an unshakeable mindset. \n\nBreak Habits: Stop waiting for the 'perfect timing' or the 'perfect plan' to materialize. \n\nDemand Action: Identify your primary bottleneck today, strip away the secondary details, and take action on the core issue. What is the very first step you will execute?";
    if (hasIntent) {
      responseText += " [OFFER_WORKBOOK]";
    }
  }

  res.json({ text: responseText });
});

// Secure ElevenLabs Text-To-Speech Proxy Endpoint
app.post('/api/voice', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required." });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const isVoiceEnabled = !!apiKey && apiKey !== 'YOUR_ELEVENLABS_API_KEY_HERE';
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  // Clean the text from intent brackets
  const cleanedText = text.replace(/\[OFFER_WORKBOOK\]/g, '').trim();

  if (isVoiceEnabled) {
    try {
      console.log(`[Voice Proxy] Synthesizing speech via ElevenLabs for text: "${cleanedText.substring(0, 50)}..."`);
      
      const response = await axios({
        method: 'post',
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg'
        },
        data: {
          text: cleanedText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.55,
            similarity_boost: 0.75
          }
        },
        responseType: 'arraybuffer'
      });

      res.set('Content-Type', 'audio/mpeg');
      return res.send(response.data);
    } catch (err) {
      console.error("[ElevenLabs API Error]", err.response ? err.response.data.toString() : err.message);
      // Fall through to fallback trigger
    }
  }

  // Fallback: Return a 204 or JSON indicating no-key/failure so client speech synthesis is used
  console.log("[Voice Proxy] Running in SpeechSynthesis fallback mode.");
  res.json({ fallback: true, text: cleanedText });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` SlayGiant.com secure server running on port ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
