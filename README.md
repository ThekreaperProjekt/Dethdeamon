Xero – DethDeamon Project

This repository contains the source code and assets for DethDeamon, a multimedia demo exploring dark aesthetics through interactive chat, generative audio and striking visuals. The project includes a web client (JavaScript/CSS/HTML) and other components such as a JUCE plug‑in skeleton and supporting assets.

Contents
   •   App.js – JavaScript powering the browser chat. It generates dialogue, drives the Web Audio “jam” engine (kick/snare/hat), and now runs without any PG‑mode or safe‑mode restrictions.
   •   Style.css – A custom dark theme with grey and red hues plus glitch, smoke, pulse and flicker effects. It provides the visual atmosphere for the site.
   •   index.html – Basic page structure for the web demo, linking the updated script and styles.
   •   kreaper_core_plugin.cpp, JuceHeader.h, XeroLive.jucer – Source files for a JUCE‑based audio plug‑in (not yet compiled in this demo). These files lay the groundwork for future audio processing experiments.
   •   images/videos – Visual assets including fog textures (billowing-ground-fog-swirls-and-flows-loop-free-video.jpg) and animated GIFs (2a8fb5df17e79f811057702e36548b4f.gif) to support stage design and mood boards.
   •   chat transcripts / text files – Various .txt and .html.txt files may contain notes or transcripts from earlier brainstorming sessions. You can include salient ideas from those documents into the dialogue pool in App.js or use them for thematic reference.

Getting Started
	1.	Clone this repository locally and serve it via a simple HTTP server:
