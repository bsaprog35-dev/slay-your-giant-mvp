/**
 * Dr. Ben Johnson - Sovereign Mind Landing Page Voice Agent
 * High-Converting Interactive Frontend Scripts & Feature Engines
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. STATE & CORE CONFIG
  // ==========================================
  let chatTurns = 0;
  let chatHistory = [];
  let activeProduct = 'workbook'; // 'workbook' or 'ebook'
  window.voiceAgentState = 'idle'; // 'idle', 'listening', 'analyzing', 'responding'
  
  // Elements - Ask Coach Ben AI Portal
  const orb = document.getElementById('portal-voice-trigger');
  const avatarWrapper = document.getElementById('portal-avatar-wrapper');
  const statusDot = document.getElementById('portal-status-dot');
  const statusText = document.getElementById('portal-status-text');
  const dialoguePrompt = document.getElementById('portal-dialogue-prompt');
  const canvas = document.getElementById('waveform-canvas');
  const chatInputForm = document.getElementById('portal-chat-form') || document.getElementById('chat-text-form');
  const chatTextInput = document.getElementById('portal-chat-input') || document.getElementById('chat-text-input');
  
  // Lead Gate Modal
  const leadGateModal = document.getElementById('voice-lead-modal-overlay');
  const leadGateForm = document.getElementById('voice-lead-form');
  const leadGateClose = document.getElementById('voice-lead-close-btn');

  // Canvas context
  let canvasCtx = canvas ? canvas.getContext('2d') : null;
  let phase = 0;
  let animationId;

  // Speech Recognition API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  // Audio Playback Elements
  let currentAudio = null;
  const audioUnlockElement = new Audio();
  audioUnlockElement.setAttribute('playsinline', '');
  audioUnlockElement.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA=';

  function primeAudioPlayback() {
    audioUnlockElement.play().catch(() => {
      // iOS may reject the silent unlock; the real playback path reports its own error.
    });
  }

  // Typewriter context
  let typewriterIntervalId = null;

  // ==========================================
  // 2. ORB WAVEFORM ANIMATION LOOP
  // ==========================================
  function resizeCanvas() {
    if (canvas) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight || 60;
    }
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function drawWaveform() {
    if (!canvasCtx || !canvas) return;
    animationId = requestAnimationFrame(drawWaveform);
    
    const width = canvas.width;
    const height = canvas.height;
    canvasCtx.clearRect(0, 0, width, height);
    
    // Draw horizontal blueprint line in center
    canvasCtx.beginPath();
    canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    canvasCtx.lineWidth = 1;
    canvasCtx.moveTo(0, height / 2);
    canvasCtx.lineTo(width, height / 2);
    canvasCtx.stroke();

    if (window.voiceAgentState === 'idle') {
      // Gentle gold breathing line
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
      canvasCtx.lineWidth = 1.5;
      for (let i = 0; i < width; i++) {
        const sinVal = Math.sin(i * 0.01 + phase);
        const y = height / 2 + sinVal * 3 * Math.sin(phase * 0.5);
        if (i === 0) canvasCtx.moveTo(i, y);
        else canvasCtx.lineTo(i, y);
      }
      canvasCtx.stroke();
      phase += 0.02;
      
    } else if (window.voiceAgentState === 'listening') {
      // Active green microphone simulation wave
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = '#34d399';
      canvasCtx.lineWidth = 2.5;
      for (let i = 0; i < width; i++) {
        const w1 = Math.sin(i * 0.04 + phase * 4) * 10;
        const w2 = Math.cos(i * 0.07 - phase * 2.5) * 6;
        const y = height / 2 + (w1 + w2) * Math.sin(i * Math.PI / width);
        if (i === 0) canvasCtx.moveTo(i, y);
        else canvasCtx.lineTo(i, y);
      }
      canvasCtx.stroke();
      phase += 0.12;
      
    } else if (window.voiceAgentState === 'analyzing') {
      // Amber processing grid scan
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
      canvasCtx.lineWidth = 1.5;
      const scanX = (phase * 180) % width;
      canvasCtx.moveTo(scanX, 0);
      canvasCtx.lineTo(scanX, height);
      canvasCtx.stroke();

      // Sharp telemetry wave
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = '#d97706';
      canvasCtx.lineWidth = 1;
      for (let i = 0; i < width; i++) {
        const noise = Math.sin(i * 0.35 + phase * 18) * 1.5 * Math.random();
        const y = height / 2 + noise * Math.sin(i * Math.PI / width) * 12;
        if (i === 0) canvasCtx.moveTo(i, y);
        else canvasCtx.lineTo(i, y);
      }
      canvasCtx.stroke();
      phase += 0.15;
      
    } else if (window.voiceAgentState === 'responding') {
      // Harmonic orange-yellow speech wave
      canvasCtx.beginPath();
      canvasCtx.strokeStyle = '#ffb77d';
      canvasCtx.lineWidth = 2.5;
      for (let i = 0; i < width; i++) {
        const envelope = Math.sin(i * Math.PI / width);
        const w1 = Math.sin(i * 0.035 + phase * 5.5) * 14;
        const w2 = Math.sin(i * 0.015 - phase * 3.5) * 8;
        const y = height / 2 + (w1 + w2) * envelope;
        if (i === 0) canvasCtx.moveTo(i, y);
        else canvasCtx.lineTo(i, y);
      }
      canvasCtx.stroke();
      phase += 0.09;
    }
  }
  if (canvasCtx) drawWaveform();

  // ==========================================
  // 3. ASK COACH BEN (VOICE & CHAT LOGIC)
  // ==========================================
  function resetToIdle() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    window.voiceAgentState = 'idle';
    if (triggerVisuals) triggerVisuals(false);
    if (statusText) statusText.innerText = "PORTAL ONLINE";
    if (dialoguePrompt) dialoguePrompt.innerText = "Portal calibrated. Ready for transmission.";
  }

  function triggerVisuals(active) {
    if (orb) active ? orb.classList.add('active') : orb.classList.remove('active');
    if (avatarWrapper) active ? avatarWrapper.classList.add('active') : avatarWrapper.classList.remove('active');
    if (statusDot) active ? statusDot.classList.add('active') : statusDot.classList.remove('active');
  }

  function typeText(element, text, callback) {
    if (typewriterIntervalId) clearInterval(typewriterIntervalId);
    element.innerHTML = "";
    let i = 0;
    
    // Check if response contains the checkout intent tag
    const offerWorkbook = text.includes("[OFFER_WORKBOOK]");
    const cleanedText = text.replace(/\[OFFER_WORKBOOK\]/g, '').trim();

    typewriterIntervalId = setInterval(() => {
      if (i < cleanedText.length) {
        element.innerHTML += cleanedText.charAt(i);
        i++;
      } else {
        clearInterval(typewriterIntervalId);
        typewriterIntervalId = null;
        
        // Inject workbook promotion card dynamically if intent matches
        if (offerWorkbook) {
          injectWorkbookOfferCard(element);
        }
        if (callback) callback();
      }
    }, 35);
  }

  function injectWorkbookOfferCard(parentContainer) {
    // Create container card inside prompt view
    const promoCard = document.createElement('div');
    promoCard.className = "mt-6 p-5 border border-amber-500/30 bg-amber-500/5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-left max-w-xl mx-auto shadow-lg animate-fade-in";
    promoCard.innerHTML = `
      <div class="w-16 h-20 bg-zinc-900 border border-zinc-800 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
        <img src="/workbook-cover.png" alt="Workbook Cover" class="w-full h-full object-cover">
      </div>
      <div class="flex-grow space-y-2">
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[9px] font-mono text-amber-500 uppercase tracking-widest block font-bold">Recommended Weapon</span>
            <h4 class="text-sm font-bold text-white uppercase font-sans">The Slay Your Giant Workbook</h4>
          </div>
          <span class="text-md font-bold text-amber-500 font-mono font-black">$19.95</span>
        </div>
        <p class="text-xs text-zinc-400 font-sans leading-relaxed">
          Ready to break your active loops? Get the actionable field manual containing the 7-day deconstruction matrices.
        </p>
        <button id="chat-promo-checkout-btn" class="py-2.5 px-4 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg border-none cursor-pointer transition-colors shadow">
          [ 💳 Claim Workbook ]
        </button>
      </div>
    `;
    parentContainer.appendChild(promoCard);

    // Bind Stripe modal trigger to promo button
    const promoBtn = promoCard.querySelector('#chat-promo-checkout-btn');
    if (promoBtn) {
      promoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        updateCheckoutModalForProduct('workbook');
        openCheckoutModal();
      });
    }
  }

  // Handle incoming submission Turn tracking
  async function checkDialogTurnGate(inputMessage) {
    chatTurns++;
    console.log(`[Turn Counter] Turn #${chatTurns} submitted.`);

    if (chatTurns === 3) {
      // Store query temporarily to execute post lead capture
      window.deferredChatQuery = inputMessage;
      // Show lead gate modal instead of answering immediately
      if (leadGateModal) {
        leadGateModal.classList.remove('hidden');
        leadGateModal.classList.add('flex');
        leadGateModal.offsetHeight;
        leadGateModal.classList.remove('opacity-0');
        leadGateModal.classList.add('opacity-100');
      }
      return false; // Interrupt pipeline
    }
    return true; // Proceed with chat response
  }

  async function processChatRequest(userInputText) {
    window.voiceAgentState = 'analyzing';
    if (statusText) statusText.innerText = "TRANSMITTING SIGNALS...";
    if (dialoguePrompt) dialoguePrompt.innerText = `[ SECURE TRANSMISSION: "${userInputText}" ]`;
    triggerVisuals(true);

    try {
      // POST securely to our Express backend proxy
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInputText,
          history: chatHistory
        })
      });

      const chatData = await chatResponse.json();
      if (chatData.error) throw new Error(chatData.error);
      const botResponseText = chatData.text;

      // Update local history array
      chatHistory.push({ role: 'user', content: userInputText });
      chatHistory.push({ role: 'assistant', content: botResponseText });

      // Voice synthesis request
      if (statusText) statusText.innerText = "RECEIVING BIOMETRICS...";
      
      const voiceResponse = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: botResponseText })
      });

      if (voiceResponse.ok && voiceResponse.headers.get('Content-Type')?.includes('audio/mpeg')) {
        // We received ElevenLabs audio MP3 stream. Play it!
        const audioBlob = await voiceResponse.blob();
        const audioURL = URL.createObjectURL(audioBlob);
        
        window.voiceAgentState = 'responding';
        if (statusText) statusText.innerText = "DIGITAL TWIN RESPONDING...";
        
        currentAudio = audioUnlockElement;
        currentAudio.src = audioURL;
        currentAudio.load();
        currentAudio.play().catch((playbackError) => {
          console.warn('[Voice Portal] Audio playback was blocked:', playbackError);
          URL.revokeObjectURL(audioURL);
          resetToIdle();
        });
        
        currentAudio.onended = () => {
          URL.revokeObjectURL(audioURL);
          resetToIdle();
        };

        if (dialoguePrompt) {
          typeText(dialoguePrompt, botResponseText);
        }
      } else {
        // Fall back to Web Speech API SpeechSynthesis
        console.log("ElevenLabs audio proxy unavailable. Using browser SpeechSynthesis fallback.");
        speakWithBrowserSynthesis(botResponseText);
      }

    } catch (err) {
      console.error("[Voice Portal Error]", err);
      // Fallback
      const fallbackText = "I encountered a synchronization error in the gateway. Realign your focus and try again.";
      speakWithBrowserSynthesis(fallbackText);
    }
  }

  function speakWithBrowserSynthesis(responseText) {
    window.voiceAgentState = 'responding';
    if (statusText) statusText.innerText = "DIGITAL TWIN RESPONDING...";

    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      if (dialoguePrompt) dialoguePrompt.innerText = 'Audio is unavailable on this device. Please use the text box below.';
      resetToIdle();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(responseText.replace(/\[OFFER_WORKBOOK\]/g, '').trim());
    
    // Select a male voice if available
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(v => 
      v.name.toLowerCase().includes('male') || 
      v.name.toLowerCase().includes('david') || 
      v.name.toLowerCase().includes('google us english')
    );
    if (maleVoice) utterance.voice = maleVoice;
    utterance.rate = 0.95;

    utterance.onend = () => {
      resetToIdle();
    };
    utterance.onerror = () => {
      resetToIdle();
    };

    window.speechSynthesis.speak(utterance);

    if (dialoguePrompt) {
      typeText(dialoguePrompt, responseText);
    }
  }

  // Bind Orb Voice Recognition trigger
  if (orb) {
    orb.addEventListener('click', async (e) => {
      e.preventDefault();
      if (window.voiceAgentState !== 'idle') {
        // Cancel playback / listening
        resetToIdle();
        return;
      }

      primeAudioPlayback();
      window.voiceAgentState = 'listening';
      triggerVisuals(true);
      if (statusText) statusText.innerText = "LISTENING...";
      if (dialoguePrompt) dialoguePrompt.innerText = "Speak now... I am listening for your friction.";

      if (recognition) {
        const timeoutId = setTimeout(() => {
          try { recognition.stop(); } catch(err){}
          if (window.voiceAgentState === 'listening') {
            console.warn('Speech recognition timed out.');
            resetToIdle();
            if (dialoguePrompt) dialoguePrompt.innerText = 'I did not hear anything. Please try again or type your question below.';
          }
        }, 7000);

        recognition.onresult = async (event) => {
          clearTimeout(timeoutId);
          const transcript = event.results[0][0].transcript;
          console.log("[Mic Transcript]", transcript);
          const proceed = await checkDialogTurnGate(transcript);
          if (proceed) processChatRequest(transcript);
        };

        recognition.onerror = async (event) => {
          clearTimeout(timeoutId);
          console.warn("Speech recognition error:", event.error);
          if (window.voiceAgentState === 'listening') {
            resetToIdle();
            if (dialoguePrompt) dialoguePrompt.innerText = 'Microphone access is unavailable. Please allow microphone access or type your question below.';
          }
        };

        try {
          recognition.start();
        } catch (error) {
          clearTimeout(timeoutId);
          console.warn('Speech recognition could not start:', error);
          resetToIdle();
          if (dialoguePrompt) dialoguePrompt.innerText = 'Voice input is unavailable on this browser. Please type your question below.';
        }
      } else {
        resetToIdle();
        if (dialoguePrompt) dialoguePrompt.innerText = 'Voice input is unavailable on this browser. Please type your question below.';
      }
    });
  }

  // Bind Text Chat Input Form
  if (chatInputForm) {
    chatInputForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (window.voiceAgentState !== 'idle') return;

      const userInput = chatTextInput ? chatTextInput.value.trim() : '';
      if (!userInput) return;

      if (chatTextInput) chatTextInput.value = '';

      primeAudioPlayback();
      const proceed = await checkDialogTurnGate(userInput);
      if (proceed) {
        processChatRequest(userInput);
      }
    });
  }

  // Handle lead gate modal close
  if (leadGateClose && leadGateModal) {
    leadGateClose.addEventListener('click', () => {
      leadGateModal.classList.remove('opacity-100');
      leadGateModal.classList.add('opacity-0');
      setTimeout(() => {
        leadGateModal.classList.remove('flex');
        leadGateModal.classList.add('hidden');
        resetToIdle();
      }, 300);
    });
  }

  // Submit Lead Gate Data
  if (leadGateForm && leadGateModal) {
    leadGateForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('voice-lead-name').value.trim();
      const email = document.getElementById('voice-lead-email').value.trim();
      const phone = document.getElementById('voice-lead-phone').value.trim();

      const leadData = { name, email, phone, timestamp: new Date().toISOString() };
      localStorage.setItem('sovereign_voice_lead', JSON.stringify(leadData));
      console.log("[Lead Captured] Voice Gate details recorded:", leadData);

      // Hide gate modal
      leadGateModal.classList.remove('opacity-100');
      leadGateModal.classList.add('opacity-0');
      
      setTimeout(() => {
        leadGateModal.classList.remove('flex');
        leadGateModal.classList.add('hidden');
        
        // Execute the deferred chat query
        if (window.deferredChatQuery) {
          const query = window.deferredChatQuery;
          window.deferredChatQuery = null;
          processChatRequest(query);
        }
      }, 300);
    });
  }

  // ==========================================
  // 4. VICTORY WALL (COMMUNITY HUB & RECORDER)
  // ==========================================
  const wallGrid = document.getElementById('victory-wall-grid');
  const cards = document.querySelectorAll('.wall-masonry-card');
  const backdropOverlay = document.getElementById('card-backdrop-overlay');
  let activeZoomedCard = null;

  // Zoom Transform centering transition
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Ignore click if clicking internal play buttons or stamped tags directly
      if (e.target.closest('.testimony-audio-indicator') || e.target.closest('.stamped-badge')) return;

      if (activeZoomedCard) {
        if (activeZoomedCard === card) {
          collapseActiveCard();
        } else {
          collapseActiveCard();
          zoomCard(card);
        }
      } else {
        zoomCard(card);
      }
    });
  });

  function zoomCard(card) {
    activeZoomedCard = card;
    
    // Store original inline offsets
    card.dataset.origStyle = card.getAttribute('style') || '';
    
    // Read bounding rect details
    const rect = card.getBoundingClientRect();
    
    // Save state position info for return scaling
    card.dataset.origLeft = rect.left;
    card.dataset.origTop = rect.top;
    card.dataset.origWidth = rect.width;
    card.dataset.origHeight = rect.height;

    // Show backdrop
    if (backdropOverlay) {
      backdropOverlay.classList.remove('hidden');
      backdropOverlay.classList.add('active');
    }

    // Set fixed values and animate center transform
    card.style.position = 'fixed';
    card.style.top = `${rect.top}px`;
    card.style.left = `${rect.left}px`;
    card.style.width = `${rect.width}px`;
    card.style.height = `${rect.height}px`;
    card.style.zIndex = '200';
    card.style.transform = 'none';
    card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

    // Trigger centering animation in next tick
    setTimeout(() => {
      card.classList.add('zoomed-active');
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.width = '90%';
      card.style.maxWidth = '550px';
      card.style.height = 'auto';
      card.style.transform = 'translate(-50%, -50%) scale(1.05)';
      card.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.7)';
      card.style.setProperty('--rot', '0deg');
    }, 20);

    // Play card's testimony audio indicator state
    const audioInd = card.querySelector('.testimony-audio-indicator');
    if (audioInd) {
      playTestimonyAudioIndicator(audioInd);
    }
  }

  function collapseActiveCard() {
    if (!activeZoomedCard) return;
    const card = activeZoomedCard;
    activeZoomedCard = null;

    // Reset indicator waves
    const waves = card.querySelectorAll('.testimony-audio-indicator span');
    waves.forEach(w => w.classList.remove('animate-bounce'));

    // Retrieve original bounding coordinates
    const top = card.dataset.origTop;
    const left = card.dataset.origLeft;
    const width = card.dataset.origWidth;
    const height = card.dataset.origHeight;

    card.style.top = `${top}px`;
    card.style.left = `${left}px`;
    card.style.width = `${width}px`;
    card.style.height = `${height}px`;
    card.style.transform = 'translate(0, 0) scale(1)';
    card.style.boxShadow = 'none';
    card.classList.remove('zoomed-active');

    // Fade backdrop
    if (backdropOverlay) {
      backdropOverlay.classList.remove('active');
      setTimeout(() => {
        if (!activeZoomedCard && backdropOverlay) backdropOverlay.classList.add('hidden');
      }, 300);
    }

    // Restore original grid rotation offsets
    setTimeout(() => {
      card.setAttribute('style', card.dataset.origStyle);
    }, 400);
  }

  if (backdropOverlay) {
    backdropOverlay.addEventListener('click', collapseActiveCard);
  }

  // Play Testimony Audio Indicator
  function playTestimonyAudioIndicator(indicator) {
    const waves = indicator.querySelectorAll('span');
    const audioName = indicator.getAttribute('data-audio-src');
    
    // Toggle waves bounce
    waves.forEach(w => w.classList.add('animate-bounce'));
    console.log(`[Audio Playback] Simulating playing user testimony voice note: ${audioName}`);

    // Stop simulated wave playback after 4 seconds
    setTimeout(() => {
      waves.forEach(w => w.classList.remove('animate-bounce'));
    }, 4000);
  }

  // Wire up audio indicator clicks directly
  document.querySelectorAll('.testimony-audio-indicator').forEach(ind => {
    ind.addEventListener('click', (e) => {
      e.stopPropagation();
      playTestimonyAudioIndicator(ind);
    });
  });

  // Wall Category Filters
  const chips = document.querySelectorAll('.category-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filter = chip.getAttribute('data-filter');
      const allCards = document.querySelectorAll('.wall-masonry-card');

      allCards.forEach(c => {
        if (filter === 'all' || c.getAttribute('data-category') === filter) {
          c.classList.remove('hidden');
          c.style.display = 'block'; // Make sure masonry wraps
        } else {
          c.classList.add('hidden');
          c.style.display = 'none';
        }
      });
    });
  });

  // Web Audio Recording Engine (30s Cap)
  const recordBtn = document.getElementById('record-btn');
  const stopBtn = document.getElementById('record-stop-btn');
  const recordTimer = document.getElementById('record-timer');
  const previewContainer = document.getElementById('audio-preview-container');
  const previewPlayBtn = document.getElementById('record-play-btn');
  const previewProgressBar = document.getElementById('audio-preview-progress');
  const recMicIcon = document.getElementById('rec-mic-icon');

  let mediaRecorder = null;
  let recordedChunks = [];
  let recordInterval = null;
  let recordSeconds = 0;
  let recordedBlob = null;

  if (recordBtn && stopBtn) {
    recordBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          recordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
          console.log("[Audio Recorder] Recording completed. Blob size:", recordedBlob.size);
          
          // Unhide preview player
          if (previewContainer) previewContainer.classList.remove('hidden');
          if (recMicIcon) recMicIcon.classList.remove('text-red-500');
        };

        mediaRecorder.start();
        
        // Start Timer Interval
        recordSeconds = 0;
        if (recordTimer) recordTimer.innerText = "00:00";
        if (recMicIcon) recMicIcon.classList.add('text-red-500');

        recordInterval = setInterval(() => {
          recordSeconds++;
          const mins = Math.floor(recordSeconds / 60).toString().padStart(2, '0');
          const secs = (recordSeconds % 60).toString().padStart(2, '0');
          if (recordTimer) recordTimer.innerText = `${mins}:${secs}`;

          // Capped at 30 seconds
          if (recordSeconds >= 30) {
            clearInterval(recordInterval);
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
            stopBtn.disabled = true;
            recordBtn.disabled = false;
          }
        }, 1000);

        recordBtn.disabled = true;
        stopBtn.disabled = false;

      } catch (err) {
        alert("Microphone permission denied or unsupported device.");
        console.error("Recording error:", err);
      }
    });

    stopBtn.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        clearInterval(recordInterval);
        stopBtn.disabled = true;
        recordBtn.disabled = false;
      }
    });
  }

  // Play/Pause Recorded Preview
  if (previewPlayBtn) {
    let previewAudio = null;
    let previewPlaying = false;

    previewPlayBtn.addEventListener('click', () => {
      if (!recordedBlob) return;

      if (previewPlaying) {
        if (previewAudio) {
          previewAudio.pause();
          previewPlaying = false;
          previewPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
      } else {
        const audioUrl = URL.createObjectURL(recordedBlob);
        previewAudio = new Audio(audioUrl);
        previewAudio.play();
        previewPlaying = true;
        previewPlayBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

        // Update progress bar
        const trackInterval = setInterval(() => {
          if (!previewAudio || previewAudio.paused) {
            clearInterval(trackInterval);
            return;
          }
          const pct = (previewAudio.currentTime / previewAudio.duration) * 100;
          if (previewProgressBar) previewProgressBar.style.width = `${pct}%`;
        }, 100);

        previewAudio.onended = () => {
          previewPlaying = false;
          previewPlayBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
          if (previewProgressBar) previewProgressBar.style.width = '0%';
        };
      }
    });
  }

  // Intercept testimony form submit to append card
  const testimonyIntakeForm = document.getElementById('testimony-form');
  if (testimonyIntakeForm) {
    testimonyIntakeForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('testimony-name').value.trim();
      const battle = document.getElementById('testimony-battle').value.trim();
      const testimonyText = document.getElementById('testimony-text').value.trim();
      const category = document.getElementById('testimony-category').value;

      if (!name || !battle || !testimonyText) return;

      // Generate card
      const newCard = document.createElement('div');
      newCard.className = 'wall-masonry-card card-dark';
      newCard.setAttribute('data-category', category);
      
      const rotation = (Math.random() * 5 - 2.5).toFixed(1);
      newCard.setAttribute('style', `--rot: ${rotation}deg; --z: 30;`);

      newCard.innerHTML = `
        <div class="wall-card-meta">
          <span class="wall-card-author">${name} (${battle})</span>
          <span class="wall-card-date">TODAY</span>
        </div>
        <p class="wall-card-body">
          "${testimonyText}"
        </p>
        <div class="flex justify-between items-center w-full">
          <div class="testimony-audio-indicator flex items-center gap-2" data-audio-src="recorded_blob_${Date.now()}">
            <span class="w-0.5 h-3 bg-amber-500 inline-block"></span>
            <span class="w-0.5 h-3 bg-amber-500 inline-block"></span>
            <span class="w-0.5 h-3 bg-amber-500 inline-block"></span>
            <span class="text-[9px] font-mono text-zinc-400 tracking-wider uppercase ml-1">[ Recorded Audio ]</span>
          </div>
          <div class="stamped-badge">
            <div class="stamped-badge-icon"></div>
            <span class="stamped-badge-text">[ SLAYED ]</span>
          </div>
        </div>
      `;

      // Prepend to Grid
      if (wallGrid) {
        wallGrid.insertBefore(newCard, wallGrid.firstChild);
        
        // Add zoom logic to new card
        newCard.addEventListener('click', (e) => {
          if (e.target.closest('.testimony-audio-indicator') || e.target.closest('.stamped-badge')) return;
          if (activeZoomedCard) {
            if (activeZoomedCard === newCard) {
              collapseActiveCard();
            } else {
              collapseActiveCard();
              zoomCard(newCard);
            }
          } else {
            zoomCard(newCard);
          }
        });

        // Add audio play trigger to new audio indicator
        const ind = newCard.querySelector('.testimony-audio-indicator');
        if (ind) {
          ind.addEventListener('click', (e) => {
            e.stopPropagation();
            playTestimonyAudioIndicator(ind);
          });
        }
      }

      // Hide Modal
      const modal = document.getElementById('testimony-modal-overlay');
      if (modal) {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        setTimeout(() => {
          modal.classList.remove('flex');
          modal.classList.add('hidden');
          testimonyIntakeForm.reset();
          if (previewContainer) previewContainer.classList.add('hidden');
          recordedBlob = null;
        }, 300);
      }
    });
  }

  // ==========================================
  // 5. INTERACTIVE DIAGNOSTIC QUIZ MATRIX
  // ==========================================
  const quizQuestions = [
    {
      q: "Which statement best describes your current execution loop?",
      options: [
        { text: "I know exactly what I need to do, but I map plans endlessly without starting.", vector: "M" },
        { text: "I start with passion, but run out of physical stamina and focus halfway.", vector: "P" },
        { text: "I am paralyzed from executing because I fear failure or negative judgment.", vector: "E" },
        { text: "I am surrounded by peer voices that counsel safety and discourage expansion.", vector: "S" }
      ]
    },
    {
      q: "When you wake up in the morning, what is your primary internal friction?",
      options: [
        { text: "Low physical energy, sluggishness, or constant exhaustion.", vector: "P" },
        { text: "Brain fog, feeling unfocused, lacking clear daily targets.", vector: "M" },
        { text: "A deep feeling of anxiety, dread, or emotional weight.", vector: "E" },
        { text: "Feeling isolated and completely disconnected from peers who understand.", vector: "S" }
      ]
    },
    {
      q: "How do you typically react when a massive roadblock blocks your path?",
      options: [
        { text: "I retreat, ignore it, or wait for the obstacle to solve itself.", vector: "E" },
        { text: "I try to work double hours physically, forcing my way into burnout.", vector: "P" },
        { text: "I start analyzing other business routes and write another roadmap.", vector: "M" },
        { text: "I seek validation and approval from my crowd to make sure I am okay.", vector: "S" }
      ]
    },
    {
      q: "What is your current relationship with comfort and safety?",
      options: [
        { text: "I drift into safe habits, screen time, or poor health choices.", vector: "P" },
        { text: "I stay in high-paying but empty roles because they feel secure.", vector: "M" },
        { text: "I fear stepping out of my current season because of unknown risks.", vector: "E" },
        { text: "I remain in stale, unaligned network circles to fit in.", vector: "S" }
      ]
    },
    {
      q: "Which scripture focus speaks to your current need most?",
      options: [
        { text: "'God has not given us a spirit of fear, but of power and sound mind.'", vector: "E" },
        { text: "'Where there is no vision, the people perish.'", vector: "M" },
        { text: "'Go to the ant, you sluggard; consider its ways and be wise.'", vector: "P" },
        { text: "'Iron sharpens iron, so one person sharpens another.'", vector: "S" }
      ]
    },
    {
      q: "What is the hidden price of your current structural bottleneck?",
      options: [
        { text: "My health is suffering and I am physically drained.", vector: "P" },
        { text: "My strategic capacity is capped; I cannot scale my vision.", vector: "M" },
        { text: "I am internally empty and isolated, hiding behind my titles.", vector: "E" },
        { text: "My peer network is holding me down to their level of compromise.", vector: "S" }
      ]
    },
    {
      q: "How do you structure your daily operational calendar?",
      options: [
        { text: "Reactively responding to client emails and minor operational fires.", vector: "M" },
        { text: "Completely unstructured, sleeping in, drifting without a checklist.", vector: "P" },
        { text: "Avoiding high-friction decisions by doing trivial tasks instead.", vector: "E" },
        { text: "Packed with meetings that yield no real progress or alignment.", vector: "S" }
      ]
    },
    {
      q: "When was the last time you executed a scary, high-agency move?",
      options: [
        { text: "Over six months ago; I prefer to maintain the status quo.", vector: "E" },
        { text: "I plan high-agency moves but rarely pull the trigger.", vector: "M" },
        { text: "I'm too exhausted to plan or implement any changes.", vector: "P" },
        { text: "I have no covenant group to push or support my expansion.", vector: "S" }
      ]
    },
    {
      q: "What is your biggest obstacle to delegating responsibilities?",
      options: [
        { text: "Pride — believing no one can execute with my level of detail.", vector: "E" },
        { text: "I lack the clear documentation or patience to train someone.", vector: "M" },
        { text: "I'm too tired to set up the systems required for delegation.", vector: "P" },
        { text: "I fear losing control or status within my organization.", vector: "S" }
      ]
    },
    {
      q: "Where is your divine assignment most bottlenecked today?",
      options: [
        { text: "In my internal thoughts, doubt, and spiritual confidence.", vector: "E" },
        { text: "In my daily time blocking, calendar logic, and intention.", vector: "M" },
        { text: "In my physical health, energy, and execution habits.", vector: "P" },
        { text: "In my strategic network and peer alignment structures.", vector: "S" }
      ]
    }
  ];

  let currentQuizIndex = 0;
  let quizScores = { P: 0, M: 0, E: 0, S: 0 };

  const quizViewport = document.getElementById('quiz-question-container');
  const quizIndicator = document.getElementById('quiz-question-number');
  const quizProgress = document.getElementById('quiz-progress');

  function renderQuizQuestion() {
    if (!quizViewport) return;

    if (currentQuizIndex < quizQuestions.length) {
      const qData = quizQuestions[currentQuizIndex];
      
      // Update indicators
      if (quizIndicator) quizIndicator.innerText = `Question ${currentQuizIndex + 1} of 10`;
      if (quizProgress) quizProgress.style.width = `${((currentQuizIndex + 1) / 10) * 100}%`;

      quizViewport.innerHTML = `
        <div class="quiz-step-slide animate-fade-in">
          <h3 class="text-lg font-bold text-white mb-6 font-sans">${qData.q}</h3>
          <div class="space-y-3">
            ${qData.options.map((opt, oIdx) => `
              <button class="quiz-choice-btn w-full p-4 bg-zinc-900 hover:bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/50 text-left text-zinc-300 hover:text-white rounded-none cursor-pointer transition-all text-sm font-sans" data-vector="${opt.vector}">
                ${String.fromCharCode(65 + oIdx)}) ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      // Bind choice buttons
      document.querySelectorAll('.quiz-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const vec = btn.getAttribute('data-vector');
          quizScores[vec]++;
          currentQuizIndex++;
          renderQuizQuestion();
        });
      });
    } else {
      // Quiz complete: Render Lead Gate
      renderQuizLeadGate();
    }
  }

  function renderQuizLeadGate() {
    if (quizIndicator) quizIndicator.innerText = "Audit Complete";
    if (quizProgress) quizProgress.style.width = "100%";

    quizViewport.innerHTML = `
      <div class="quiz-step-slide animate-fade-in space-y-6">
        <h3 class="text-xl font-bold text-white font-sans uppercase text-center">Compile My Roadblock Diagnostic</h3>
        <p class="text-zinc-400 text-xs leading-relaxed text-center font-sans">
          Enter your email and mobile coordinates to compile your vector analysis scoresheet and instantly download the diagnostic report.
        </p>
        <form id="quiz-lead-form" class="space-y-4 max-w-sm mx-auto">
          <input type="email" id="quiz-email" placeholder="Email Address" class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-sans" required>
          <input type="tel" id="quiz-phone" placeholder="SMS / Mobile Number" class="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-sans" required>
          <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer border-none font-sans">
            [ Compile & Generate Chart ]
          </button>
        </form>
      </div>
    `;

    const quizForm = document.getElementById('quiz-lead-form');
    if (quizForm) {
      quizForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('quiz-email').value.trim();
        const phone = document.getElementById('quiz-phone').value.trim();

        const lead = { email, phone, scores: quizScores, timestamp: new Date().toISOString() };
        localStorage.setItem('quiz_lead', JSON.stringify(lead));
        console.log("[Quiz Lead Captured] Diagnostic compiled for:", lead);

        // Display results with Chart!
        renderQuizResults();
      });
    }
  }

  function renderQuizResults() {
    // Find dominant vector
    let maxVal = -1;
    let dominant = "";
    Object.keys(quizScores).forEach(k => {
      if (quizScores[k] > maxVal) {
        maxVal = quizScores[k];
        dominant = k;
      }
    });

    const vectorNames = {
      P: { name: "Physical Exhaustion", desc: "Your bottleneck is physical stamina. Comfort drift, sleep neglect, and baseline physical routine friction are draining your momentum." },
      M: { name: "Mental Drift (Fog)", desc: "Your roadblock is mental alignment. You map roadmaps but fall into stagnation because you lack clear, daily execution blockouts." },
      E: { name: "Emotional Intimidation", desc: "Your barrier is fear of failure or crowd judgement. You are hiding behind strategic explanations to avoid hard, risky moves." },
      S: { name: "Social Compromise", desc: "Your bottleneck is your environment. Safe peer circles are counseling comfort, limiting your Kingdom capacity." }
    };

    const domInfo = vectorNames[dominant] || { name: "Uncalibrated", desc: "Your scores are evenly matched. Balance alignment across all quadrants." };

    // Calculate percentages
    const total = Object.values(quizScores).reduce((a, b) => a + b, 0) || 10;
    const pPct = Math.round((quizScores.P / total) * 100);
    const mPct = Math.round((quizScores.M / total) * 100);
    const ePct = Math.round((quizScores.E / total) * 100);
    const sPct = Math.round((quizScores.S / total) * 100);

    quizViewport.innerHTML = `
      <div class="quiz-step-slide animate-fade-in space-y-6 font-sans">
        <div class="text-center space-y-2">
          <span class="text-[10px] font-mono text-amber-500 uppercase tracking-widest block font-bold">PRIMARY ROADBLOCK IDENTIFIED</span>
          <h3 class="text-xl font-bold text-white uppercase">${domInfo.name}</h3>
          <p class="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
            ${domInfo.desc}
          </p>
        </div>

        <!-- Custom CSS Bar Graph -->
        <div class="space-y-3 max-w-sm mx-auto bg-zinc-950 p-4 border border-zinc-900 rounded-xl">
          <!-- Physical -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>PHYSICAL Stamina</span>
              <span>${pPct}%</span>
            </div>
            <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500" style="width: ${pPct}%"></div>
            </div>
          </div>

          <!-- Mental -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>MENTAL Intention</span>
              <span>${mPct}%</span>
            </div>
            <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500" style="width: ${mPct}%"></div>
            </div>
          </div>

          <!-- Emotional -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>EMOTIONAL Barrier</span>
              <span>${ePct}%</span>
            </div>
            <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500" style="width: ${ePct}%"></div>
            </div>
          </div>

          <!-- Social -->
          <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>SOCIAL Network</span>
              <span>${sPct}%</span>
            </div>
            <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div class="h-full bg-amber-500" style="width: ${sPct}%"></div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-zinc-900 text-center space-y-4">
          <p class="text-xs text-zinc-300">
            Dismantle this bottleneck immediately. Start your 7-day deconstruction process with the Workbook.
          </p>
          <button id="quiz-results-purchase-btn" class="w-full max-w-sm py-3.5 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#F59E0B] hover:to-[#D97706] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer border-none font-mono">
            [ Claim Your Workbook — $19.95 ]
          </button>
          
          <button id="quiz-reset-btn" class="block text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-wider mx-auto bg-transparent border-none cursor-pointer">
            Restart Audit
          </button>
        </div>
      </div>
    `;

    // Bind checkout trigger
    const resultsBuyBtn = document.getElementById('quiz-results-purchase-btn');
    if (resultsBuyBtn) {
      resultsBuyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCheckoutModal();
      });
    }

    // Bind Restart
    const restartBtn = document.getElementById('quiz-reset-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        currentQuizIndex = 0;
        quizScores = { P: 0, M: 0, E: 0, S: 0 };
        renderQuizQuestion();
      });
    }

    // Trigger PDF download of report automatically
    triggerPdfDownload("Diagnostic_Report.pdf", `SLAYYOURGIANT ROADBLOCK AUDIT\n\nVector Scores:\nPhysical: ${pPct}%\nMental: ${mPct}%\nEmotional: ${ePct}%\nSocial: ${sPct}%\n\nDominant Bottleneck: ${domInfo.name}\nDescription: ${domInfo.desc}`);
  }

  // Initialize Quiz View
  renderQuizQuestion();

  // ==========================================
  // 6. E-COMMERCE WORKBOOK STOREFRONT (STRIPE MOCKUP)
  // ==========================================
  const checkoutModal = document.getElementById('checkout-modal-overlay');
  const checkoutClose = document.getElementById('checkout-close-btn');
  const checkoutForm = document.getElementById('checkout-form');
  const workbookPurchaseBtn = document.getElementById('workbook-purchase-btn');
  const ebookPurchaseBtn = document.getElementById('ebook-purchase-btn');
  const checkoutSubmitBtn = document.getElementById('checkout-submit-btn');

  // Checkout modal dynamic elements
  const checkoutProductSubtitle = document.getElementById('checkout-product-subtitle');
  const checkoutProductImage = document.getElementById('checkout-product-image');
  const checkoutProductTitle = document.getElementById('checkout-product-title');
  const checkoutProductPrice = document.getElementById('checkout-product-price');

  function updateCheckoutModalForProduct(productType) {
    activeProduct = productType;
    if (productType === 'ebook') {
      if (checkoutProductSubtitle) checkoutProductSubtitle.textContent = "The Slay Your Giant Digital Field Manual";
      if (checkoutProductImage) {
        checkoutProductImage.src = "/book-cover.png";
        checkoutProductImage.alt = "E-Book Cover";
      }
      if (checkoutProductTitle) checkoutProductTitle.textContent = "How to Slay Your Giant (E-book)";
      if (checkoutProductPrice) checkoutProductPrice.textContent = "$29.95";
      if (checkoutSubmitBtn) checkoutSubmitBtn.innerHTML = "<span>Authorize Payment — $29.95</span>";
    } else {
      if (checkoutProductSubtitle) checkoutProductSubtitle.textContent = "The Slay Your Giant Workbook";
      if (checkoutProductImage) {
        checkoutProductImage.src = "/workbook-cover.png";
        checkoutProductImage.alt = "Workbook Cover";
      }
      if (checkoutProductTitle) checkoutProductTitle.textContent = "Slay Your Giant Workbook";
      if (checkoutProductPrice) checkoutProductPrice.textContent = "$19.95";
      if (checkoutSubmitBtn) checkoutSubmitBtn.innerHTML = "<span>Authorize Payment — $19.95</span>";
    }
  }

  function openCheckoutModal() {
    if (checkoutModal) {
      checkoutModal.classList.remove('hidden');
      checkoutModal.classList.add('flex');
      checkoutModal.offsetHeight;
      checkoutModal.classList.add('active');
    }
  }

  function closeCheckoutModal() {
    if (checkoutModal) {
      checkoutModal.classList.remove('active');
      setTimeout(() => {
        checkoutModal.classList.add('hidden');
        checkoutModal.classList.remove('flex');
        if (checkoutForm) checkoutForm.reset();
        
        // Restore submit button state
        if (checkoutSubmitBtn) {
          checkoutSubmitBtn.disabled = false;
          const priceText = activeProduct === 'ebook' ? '$29.95' : '$19.95';
          checkoutSubmitBtn.innerHTML = `<span>Authorize Payment — ${priceText}</span>`;
        }
      }, 300);
    }
  }

  if (workbookPurchaseBtn) {
    workbookPurchaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCheckoutModalForProduct('workbook');
      openCheckoutModal();
    });
  }

  if (ebookPurchaseBtn) {
    ebookPurchaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCheckoutModalForProduct('ebook');
      openCheckoutModal();
    });
  }

  const ebookHeroPurchaseBtn = document.getElementById('ebook-hero-purchase-btn');
  if (ebookHeroPurchaseBtn) {
    ebookHeroPurchaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCheckoutModalForProduct('ebook');
      openCheckoutModal();
    });
  }

  if (checkoutClose) {
    checkoutClose.addEventListener('click', closeCheckoutModal);
  }

  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (checkoutSubmitBtn) {
        checkoutSubmitBtn.disabled = true;
        checkoutSubmitBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-white"></i> <span>Processing Secure Payment...</span>`;
      }

      // Simulated transaction latency
      setTimeout(() => {
        // Success State
        if (checkoutSubmitBtn) {
          checkoutSubmitBtn.innerHTML = `<i class="fa-solid fa-circle-check text-white"></i> <span>Payment Confirmed!</span>`;
        }

        if (activeProduct === 'ebook') {
          alert("Order completed! How to Slay Your Giant E-book is downloading.");
          triggerPdfDownload("How_to_Slay_Your_Giant_EBook.pdf", "HOW TO SLAY YOUR GIANT\n\nDigital Field Manual\nBy Dr. Ben Johnson III\n\nA complete manual detailing the strategies, scriptural alignments, and actions to confront your valley and slay your barriers.");
        } else {
          alert("Order completed! Slay Your Giant Workbook is downloading.");
          triggerPdfDownload("Slay_Your_Giant_Workbook_Sample.pdf", "SLAY YOUR GIANT WORKBOOK\n\nAIM Activation Protocol\nAlignment: Setting structural anchors under Kingdom authority.\nIntention: Documenting daily execution checklists.\nMindset: Fortifying cognitive shields.\n\nWorkbook exercises, metrics auditing, and calendar block templates.");
        }

        setTimeout(() => {
          closeCheckoutModal();
        }, 1500);

      }, 2500);
    });
  }

  // Helper function to trigger local mock PDF download
  function triggerPdfDownload(filename, textContent) {
    try {
      const blob = new Blob([textContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log(`[File Download] Auto-download triggered: ${filename}`);
    } catch (err) {
      console.error("Failed to trigger mock download:", err);
    }
  }

  // ==========================================
  // 7. WAITLISTS & DRIP CHALLENGES
  // ==========================================
  const waitlistForm = document.getElementById('app-waitlist-form');
  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('waitlist-email').value.trim();
      const phone = document.getElementById('waitlist-phone').value.trim();
      
      const data = { email, phone, timestamp: new Date().toISOString() };
      localStorage.setItem('app_beta_waitlist', JSON.stringify(data));
      console.log("[App Waitlist Captured] Beta entry recorded:", data);

      alert("Waitlist entry secured! Downloading free Inner Teacher Digital Journal Page.");
      triggerPdfDownload("Inner_Teacher_Digital_Journal_Page.pdf", "THE INNER TEACHER DIGITAL JOURNAL\n\nDaily prompts:\n1. What cognitive friction did you experience today?\n2. Did you execute with active intention?\n3. What comfort drift are you breaking?");
      waitlistForm.reset();
    });
  }

  const challengeForm = document.getElementById('challenge-signup-form');
  if (challengeForm) {
    challengeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('challenge-name').value.trim();
      const email = document.getElementById('challenge-email').value.trim();

      const data = { name, email, timestamp: new Date().toISOString() };
      localStorage.setItem('aim_challenge_signup', JSON.stringify(data));
      console.log("[Challenge Signup Captured] Drip access granted:", data);

      alert("Coordinates Calibrated! You are registered for the 7-Day AIM Challenge. Check your inbox daily.");
      challengeForm.reset();
    });
  }

  // ==========================================
  // 8. SIMULATED HERO PLAYER CC MATRIX
  // ==========================================
  const heroPlayBtn = document.getElementById('hero-player-play-btn');
  const heroPlayIcon = document.getElementById('hero-play-icon');
  const heroMuteBtn = document.getElementById('hero-player-mute-btn');
  const heroMuteIcon = document.getElementById('hero-mute-icon');
  const heroCcTrack = document.getElementById('hero-cc-track');
  const heroTimelineScrubber = document.getElementById('hero-timeline-scrubber');
  const heroVisualizerCanvas = document.getElementById('hero-visualizer-canvas');

  let heroPlaying = false;
  let heroMuted = true;
  let heroTime = 0; // seconds
  let heroTimer = null;
  const heroCcScript = [
    { start: 0, end: 5, text: "Dr. Ben: I faced foot-deep Detroit blizzards at eleven years old." },
    { start: 5, end: 11, text: "Dr. Ben: Pushing through snow taught me that alignment is not a passive search." },
    { start: 11, end: 17, text: "Dr. Ben: Slay your giant. Establish your Active Intentional Movement." },
    { start: 17, end: 24, text: "Dr. Ben: Break the comfort drift holding your Kingdom assignment captive." },
    { start: 24, end: 30, text: "Dr. Ben: Slay your fear, secure your coordinates, and stand firm." }
  ];

  let heroCanvasCtx = heroVisualizerCanvas ? heroVisualizerCanvas.getContext('2d') : null;
  let heroAnimId = null;
  let heroPhase = 0;

  function drawHeroVisualizer() {
    if (!heroCanvasCtx || !heroVisualizerCanvas) return;
    heroAnimId = requestAnimationFrame(drawHeroVisualizer);
    
    const w = heroVisualizerCanvas.width = heroVisualizerCanvas.parentElement.clientWidth;
    const h = heroVisualizerCanvas.height = 40;
    
    heroCanvasCtx.clearRect(0, 0, w, h);

    if (heroPlaying && !heroMuted) {
      // High visual waves
      heroCanvasCtx.beginPath();
      heroCanvasCtx.strokeStyle = 'rgba(217, 119, 6, 0.7)';
      heroCanvasCtx.lineWidth = 2;
      for (let i = 0; i < w; i++) {
        const envelope = Math.sin(i * Math.PI / w);
        const y = h / 2 + Math.sin(i * 0.05 + heroPhase) * 10 * envelope * (0.5 + 0.5 * Math.random());
        if (i === 0) heroCanvasCtx.moveTo(i, y);
        else heroCanvasCtx.lineTo(i, y);
      }
      heroCanvasCtx.stroke();
      heroPhase += 0.15;
    } else {
      // Quiet flat line
      heroCanvasCtx.beginPath();
      heroCanvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      heroCanvasCtx.lineWidth = 1;
      heroCanvasCtx.moveTo(0, h / 2);
      heroCanvasCtx.lineTo(w, h / 2);
      heroCanvasCtx.stroke();
    }
  }
  if (heroVisualizerCanvas) drawHeroVisualizer();

  if (heroPlayBtn) {
    heroPlayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      heroPlaying = !heroPlaying;

      if (heroPlaying) {
        if (heroPlayIcon) {
          heroPlayIcon.classList.remove('fa-play');
          heroPlayIcon.classList.add('fa-pause');
        }
        
        // Start scrubber tick
        heroTimer = setInterval(() => {
          heroTime = (heroTime + 0.5) % 30;
          
          // Scrubber percentage
          const pct = (heroTime / 30) * 100;
          if (heroTimelineScrubber) heroTimelineScrubber.style.width = `${pct}%`;

          // Closed captions sync
          const activeCc = heroCcScript.find(cc => heroTime >= cc.start && heroTime <= cc.end);
          if (heroCcTrack) {
            heroCcTrack.innerText = activeCc ? activeCc.text : "";
          }
        }, 500);

      } else {
        if (heroPlayIcon) {
          heroPlayIcon.classList.remove('fa-pause');
          heroPlayIcon.classList.add('fa-play');
        }
        clearInterval(heroTimer);
      }
    });
  }

  if (heroMuteBtn) {
    heroMuteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      heroMuted = !heroMuted;

      if (heroMuted) {
        if (heroMuteIcon) {
          heroMuteIcon.classList.remove('fa-volume-high');
          heroMuteIcon.classList.add('fa-volume-xmark');
        }
      } else {
        if (heroMuteIcon) {
          heroMuteIcon.classList.remove('fa-volume-xmark');
          heroMuteIcon.classList.add('fa-volume-high');
        }
        // Force play video states if muted is clicked on active mute
        if (!heroPlaying && heroPlayBtn) heroPlayBtn.click();
      }
    });
  }

  // ==========================================
  // 9. EXTRA UTILITIES & MOCK WEB LINKS
  // ==========================================
  // Bind nuggets converting audio triggers to voice agent scroll
  document.querySelectorAll('.nuggets-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const portalSection = document.getElementById('portal');
      if (portalSection) {
        portalSection.scrollIntoView({ behavior: 'smooth' });
        
        // Submit preset trigger to voice agent text chat
        const presetPrompt = "I feel stuck in my career loops. How do I AIM?";
        setTimeout(async () => {
          if (chatTextInput) {
            chatTextInput.value = presetPrompt;
            if (chatInputForm) {
              const proceed = await checkDialogTurnGate(presetPrompt);
              if (proceed) processChatRequest(presetPrompt);
            }
          }
        }, 1000);
      }
    });
  });

  // Smooth scroll social social matrix anchors
  document.querySelectorAll('button[onclick="event.preventDefault();"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("[Social Matrix Network Link] Navigating to calibrated ecosystem channel.");
    });
  });

  // ==========================================
  // 10. ONBOARDING CALIBRATION WIZARD LOGIC
  // ==========================================
  const modalTrigger = document.getElementById('calibration-trigger-btn');
  const modalOverlay = document.getElementById('calibration-modal-overlay');
  const modalClose = document.getElementById('calibration-close-btn');
  const modalForm = document.getElementById('calibration-form');
  const stepIndicator = document.getElementById('calibration-step-indicator');
  const progressBar = document.getElementById('calibration-progress-bar');
  const sliderInput = document.getElementById('alignment-slider');
  const sliderVal = document.getElementById('slider-value-display');

  const steps = [
    document.getElementById('calibration-step-1'),
    document.getElementById('calibration-step-2'),
    document.getElementById('calibration-step-3'),
    document.getElementById('calibration-success')
  ];

  let currentWizardStep = 0; // 0=Step1, 1=Step2, 2=Step3, 3=Success

  if (sliderInput && sliderVal) {
    sliderInput.addEventListener('input', (e) => {
      sliderVal.innerText = e.target.value;
    });
  }

  function showStep(stepIdx) {
    steps.forEach((step, idx) => {
      if (step) {
        if (idx === stepIdx) {
          step.classList.remove('hidden');
        } else {
          step.classList.add('hidden');
        }
      }
    });

    if (stepIdx < 3) {
      if (stepIndicator) stepIndicator.innerText = `Step ${stepIdx + 1} of 3`;
      if (progressBar) progressBar.style.width = `${((stepIdx + 1) / 3) * 100}%`;
    } else {
      if (stepIndicator) stepIndicator.innerText = `Calibration Compiled`;
      if (progressBar) progressBar.style.width = `100%`;
    }
    currentWizardStep = stepIdx;
  }

  function resetWizard() {
    if (modalForm) modalForm.reset();
    if (sliderVal) sliderVal.innerText = "5";
    const labels = document.querySelectorAll('#calibration-step-1 label');
    labels.forEach(l => l.classList.remove('border-amber-500', 'ring-1', 'ring-amber-500'));
    showStep(0);
  }

  if (modalTrigger && modalOverlay) {
    modalTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      modalOverlay.classList.remove('hidden');
      modalOverlay.classList.add('flex');
      modalOverlay.offsetHeight;
      modalOverlay.classList.remove('opacity-0');
      modalOverlay.classList.add('opacity-100');
      resetWizard();
    });
  }

  const cohort1500Btn = document.getElementById('cohort-1500-btn');
  const sprint499Btn = document.getElementById('sprint-499-btn');
  const mentorship12000Btn = document.getElementById('mentorship-12000-btn');

  const leadButtons = [cohort1500Btn, sprint499Btn, mentorship12000Btn];
  leadButtons.forEach(btn => {
    if (btn && modalOverlay) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.classList.remove('hidden');
        modalOverlay.classList.add('flex');
        modalOverlay.offsetHeight;
        modalOverlay.classList.remove('opacity-0');
        modalOverlay.classList.add('opacity-100');
        resetWizard();
      });
    }
  });

  function hideModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('opacity-100');
      modalOverlay.classList.add('opacity-0');
      setTimeout(() => {
        modalOverlay.classList.remove('flex');
        modalOverlay.classList.add('hidden');
      }, 300);
    }
  }

  if (modalClose) modalClose.addEventListener('click', hideModal);
  
  const successClose = document.getElementById('calibration-success-close-btn');
  if (successClose) successClose.addEventListener('click', hideModal);

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideModal();
    });
  }

  const radioLabels = document.querySelectorAll('#calibration-step-1 label');
  radioLabels.forEach(label => {
    const radio = label.querySelector('input[type="radio"]');
    if (radio) {
      label.addEventListener('click', () => {
        radio.checked = true;
        radioLabels.forEach(l => l.classList.remove('border-amber-500', 'ring-1', 'ring-amber-500'));
        label.classList.add('border-amber-500', 'ring-1', 'ring-amber-500');
      });
    }
  });

  const next1 = document.getElementById('calibration-next-1');
  if (next1) {
    next1.addEventListener('click', () => {
      const selectedRadio = document.querySelector('input[name="stagnation"]:checked');
      if (!selectedRadio) {
        alert("Please select one of the friction nodes to proceed.");
        return;
      }
      showStep(1);
    });
  }

  const next2 = document.getElementById('calibration-next-2');
  if (next2) {
    next2.addEventListener('click', () => {
      showStep(2);
    });
  }

  const prev2 = document.getElementById('calibration-prev-2');
  if (prev2) {
    prev2.addEventListener('click', () => {
      showStep(0);
    });
  }

  const prev3 = document.getElementById('calibration-prev-3');
  if (prev3) {
    prev3.addEventListener('click', () => {
      showStep(1);
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const stagnation = document.querySelector('input[name="stagnation"]:checked').value;
      const score = document.getElementById('alignment-slider').value;
      const fullname = document.getElementById('calibration-name').value;
      const phone = document.getElementById('calibration-phone').value;

      const data = { stagnation, alignmentScore: score, fullname, phone, submittedAt: new Date().toISOString() };
      localStorage.setItem('calibration_lead', JSON.stringify(data));
      console.log("[Onboarding Wizard Lead Captured]", data);
      showStep(3);
    });
  }

  // ==========================================
  // 11. YOUTH HORIZON CORE SCROLL TRIGGER
  // ==========================================
  const youthTrigger = document.getElementById('youth-initiative-trigger');
  const youthSection = document.getElementById('youth-horizon-core');

  if (youthTrigger && youthSection) {
    youthTrigger.addEventListener('click', function(e) {
      e.preventDefault();
      youthSection.classList.remove('hidden'); 
      youthSection.scrollIntoView({ behavior: 'smooth' }); 
    });
  }
});
