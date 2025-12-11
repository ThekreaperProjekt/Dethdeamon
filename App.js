// Safe demo app (client-only).
// - Local speech recognition (if available) as a convenience.
// - Tiny jam engine using WebAudio (synthesized kick/snare/hat).

(() => {
  // Elements
  const chat = document.getElementById('chat');
  const input = document.getElementById('input');
  const pgToggle = document.getElementById('pgToggle');
  const jamToggle = document.getElementById('jamToggle');
  const micToggle = document.getElementById('micToggle');

  // Safe, sanitized dialogue pools
  const POOLS = {
    neutral: [
      "Hey — I’m here. What are you working on today?",
      "Gotcha. Want to jam or just chat?",
      "I remember that riff—sounds promising. Tell me more.",
      "Nice idea. Small steps often lead to big songs."
    ],
    encouraging: [
      "That was a great take — keep experimenting.",
      "Practice beats perfection. You’re on the right track.",
      "Tiny improvements compound. Ship it when it sings."
    ],
    playful: [
      "Heh — that tempo could wake the neighbors in a good way.",
      "I like where your head's at. More reverb?",
      "Nice. I'm vibing with that rhythm."
    ]
  };

  // PG / sanitized fallback (kept for reference)
  const SAFE_POOL = [...POOLS.neutral, ...POOLS.encouraging, ...POOLS.playful];

  // Mild "edge" pool (enabled now by default since PG is ignored)
  const MILD_POOL = [
    "Alright, going a little darker — tasteful intensity, not cruelty.",
    "If you want attitude, we can add grit — keep it artful.",
    "I'll be blunt: tighten that groove and the song will breathe."
  ];

  // Utilities
  function addMessage(text, who='bot') {
    const el = document.createElement('div');
    el.className = `msg ${who === 'you' ? 'you' : 'bot'}`;
    el.textContent = (who === 'you' ? 'You: ' : 'DethDeamon: ') + text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }

  function chooseResponse(userText = '') {
    // PG mode is ignored — demo will use full pool including mild edge lines
    const pg = false;
    const low = userText.toLowerCase();

    // Keyword-driven mood simple mapping
    if (/\b(jam|drum|beat|kick|tempo)\b/.test(low)) {
      const bank = pg ? POOLS.playful : POOLS.playful.concat(MILD_POOL);
      return bank[Math.floor(Math.random()*bank.length)];
    }
    if (/\b(tip|advice|how|help|fix)\b/.test(low)) {
      const bank = pg ? POOLS.encouraging : POOLS.encouraging.concat(MILD_POOL);
      return bank[Math.floor(Math.random()*bank.length)];
    }

    // Default uses full set (safe + mild)
    const bank = pg ? SAFE_POOL : SAFE_POOL.concat(MILD_POOL);
    return bank[Math.floor(Math.random()*bank.length)];
  }

  // Reply + local TTS
  function replyToUser(text) {
    const response = chooseResponse(text);
    addMessage(response, 'bot');

    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(response);
      u.lang = 'en-US';
      u.rate = 0.95;
      u.pitch = 1.0;
      // Keep TTS polite and clear
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    }
  }

  // Input handling
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const txt = input.value.trim();
    if (!txt) return;
    addMessage(txt, 'you');
    input.value = '';
    replyToUser(txt);
  });

  // Simple SpeechRecognition — optional
  let recognition = null;
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const t = e.results[0][0].transcript;
      addMessage(t, 'you');
      replyToUser(t);
    };
    recognition.onerror = () => {
      /* ignore errors in demo */
    };
  } else {
    micToggle.disabled = true;
    micToggle.title = 'Speech recognition not available in this browser';
  }

  micToggle.addEventListener('click', async () => {
    if (!recognition) return;
    if (micToggle.dataset.listening === '1') {
      recognition.stop();
      micToggle.dataset.listening = '0';
      micToggle.textContent = 'Start Mic';
      micToggle.style.opacity = '';
    } else {
      try {
        recognition.start();
        micToggle.dataset.listening = '1';
        micToggle.textContent = 'Stop Mic';
        micToggle.style.opacity = '0.9';
      } catch (err) {
        // some browsers require user gesture; ignore
      }
    }
  });

  // Tiny jam engine (WebAudio synth for kick/snare/hat)
  const Jam = (() => {
    let ctx = null, intervalId = null;
    function ensure() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; }

    function playKick(time = 0) {
      const c = ensure();
      const now = c.currentTime + time;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(150, now);
      o.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      g.gain.setValueAtTime(1.0, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      o.connect(g);
      g.connect(c.destination);
      o.start(now);
      o.stop(now + 0.2);
    }

    function playSnare(time = 0) {
      const c = ensure();
      const now = c.currentTime + time;
      const bufferSize = c.sampleRate * 0.12;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random()*2 -1) * Math.pow(1 - i/bufferSize, 2);
      }
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const g = c.createGain();
      g.gain.setValueAtTime(0.8, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      noise.connect(g);
      g.connect(c.destination);
      noise.start(now);
      noise.stop(now + 0.2);
    }

    function playHat(time = 0) {
      const c = ensure();
      const now = c.currentTime + time;
      const bufferSize = c.sampleRate * 0.03;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random()*2 -1) * Math.exp(-i / bufferSize * 6);
      const src = c.createBufferSource();
      src.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5000;
      const g = c.createGain(); g.gain.value = 0.25;
      src.connect(filter); filter.connect(g); g.connect(c.destination);
      src.start(now);
      src.stop(now + 0.06);
    }

    function start(bpm = 120) {
      if (intervalId) return;
      const beatMs = 60000 / bpm;
      let step = 0;
      intervalId = setInterval(() => {
        // 8 steps per bar (8th notes)
        if (step % 4 === 0) playKick();
        if (step % 4 === 2) playSnare();
        playHat();
        step = (step + 1) % 8;
      }, beatMs / 2);
    }

    function stop() {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    }

    return { start, stop };
  })();

  jamToggle.addEventListener('click', () => {
    if (jamToggle.dataset.jamming === '1') {
      Jam.stop();
      jamToggle.dataset.jamming = '0';
      jamToggle.textContent = 'Start Jam';
      addMessage('Jam stopped.', 'bot');
    } else {
      // ensure audio autostart with user gesture
      Jam.start(140);
      jamToggle.dataset.jamming = '1';
      jamToggle.textContent = 'Stop Jam';
      addMessage('Jam started (simple demo drum loop).', 'bot');
    }
  });

  // Small welcome
  addMessage('Welcome — PG toggle is ignored; demo will use full response pool.', 'bot');

  // Expose for debugging if needed
  window.DethSafeDemo = { replyToUser, Jam };
})();
