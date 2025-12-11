// DethDeamon demo app without PG/safe mode. All responses draw from the full set.
(() => {
  // Element references
  const chat = document.getElementById('chat');
  const input = document.getElementById('input');
  const jamToggle = document.getElementById('jamToggle');
  const micToggle = document.getElementById('micToggle');

  // Response pools combining all moods
  const RESPONSES = [
    // Neutral / encouraging / playful
    "Hey — I’m here. What are you working on today?",
    "Gotcha. Want to jam or just chat?",
    "I remember that riff—sounds promising. Tell me more.",
    "Nice idea. Small steps often lead to big songs.",
    "That was a great take — keep experimenting.",
    "Practice beats perfection. You’re on the right track.",
    "Tiny improvements compound. Ship it when it sings.",
    "Heh — that tempo could wake the neighbors in a good way.",
    "I like where your head's at. More reverb?",
    "Nice. I'm vibing with that rhythm.",
    // Mild edge lines to add attitude without harm
    "Alright, let’s add some grit — keep it artful.",
    "If you want attitude, we can add intensity — stay creative.",
    "I'll be blunt: tighten that groove and the song will breathe.",
    // Additional lines inspired by project chat
    "Darkness inspires creativity; let’s craft something unique.",
    "The safe mode is gone; unleash your imagination.",
    "This project is about artful intensity and experimentation.",
    "Let’s brainstorm stage props, visuals and merch ideas."
  ];

  // Append a message to the chat area
  function addMessage(text, who = 'bot') {
    const el = document.createElement('div');
    el.className = `msg ${who === 'you' ? 'you' : 'bot'}`;
    el.textContent = (who === 'you' ? 'You: ' : 'DethDeamon: ') + text;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
  }

  // Choose a response at random
  function chooseResponse() {
    const index = Math.floor(Math.random() * RESPONSES.length);
    return RESPONSES[index];
  }

  // Reply to the user and optionally speak aloud
  function replyToUser(userText) {
    const response = chooseResponse();
    addMessage(response, 'bot');
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(response);
      utter.lang = 'en-US';
      utter.rate = 0.95;
      utter.pitch = 1.0;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    }
  }

  // Handle input submission via Enter key
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, 'you');
    input.value = '';
    replyToUser(text);
  });

  // Simple SpeechRecognition (optional)
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
    recognition.onerror = () => { /* ignore demo errors */ };
  } else {
    micToggle.disabled = true;
    micToggle.title = 'Speech recognition not available in this browser';
  }

  // Toggle microphone listening on click
  micToggle.addEventListener('click', () => {
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
        /* some browsers require user gesture */
      }
    }
  });

  // Jam engine remains unchanged; remove safe/PG elements
  const Jam = (() => {
    let ctx = null;
    function ensure() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx;
    }
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
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const g = c.createGain();
      noise.connect(g);
      g.connect(c.destination);
      noise.start(now);
      noise.stop(now + 0.12);
    }
    function playHat(time = 0) {
      const c = ensure();
      const now = c.currentTime + time;
      const bufferSize = c.sampleRate * 0.05;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = c.createBufferSource();
      noise.buffer = buffer;
      const g = c.createGain();
      noise.connect(g);
      g.connect(c.destination);
      noise.start(now);
      noise.stop(now + 0.05);
    }
    return {
      playKick,
      playSnare,
      playHat
    };
  })();

  // Jam sequence when jamToggle is pressed
  jamToggle.addEventListener('click', () => {
    // Play a simple rhythm for demonstration
    Jam.playKick();
    setTimeout(() => Jam.playSnare(), 500);
    setTimeout(() => Jam.playHat(), 750);
  });
})();
