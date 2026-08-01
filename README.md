# Best Wishes For You - Time-locked Digital Gift

A beautiful, cinematic, and interactive web application designed to deliver a heartfelt digital gift to someone special. The gift is time-locked and will only unlock when a specific target date is reached.

## 🌟 Features

- **Time-Locked Countdown**: A minimalist countdown timer that counts down to the exact moment the gift unlocks.
- **Cinematic Gift Opening**: A 60fps, silky-smooth 5-phase cinematic animation to open the digital gift box (featuring CSS keyframes and particle effects).
- **Interactive Cassette Player**: An intricately detailed SVG cassette tape that acts as an audio player for a personalized voice message.
- **Synchronized Subtitles**: The voice message is accompanied by "Soft Reveal" typing subtitles, fully synchronized to the audio track.
- **Immersive Aesthetic**: A dreamy, nostalgic 35mm editorial film look with subtle background music, bokeh sticker overlays, and dynamic lighting effects.

---

## 🛠️ Customization Guide

You can easily customize this project to make it your own! Here is a step-by-step guide to replacing the assets and text.

### 1. Set the Target Date
Open `script.js` and modify the `TARGET_DATE` constant at the top of the file:
```javascript
const TARGET_DATE = new Date("2026-05-04T00:00:00+07:00");
```
*Note: Make sure to keep the ISO 8601 format with your local timezone offset.*

### 2. Replace the Audio Files
- **Background Music (`bg-music.mp3`)**: Replace this file in the root directory with any soft, ambient instrumental track.
- **Voice Message (`voice.mp3`)**: Record your personalized message and save it as `voice.mp3` in the root directory.

### 3. Customize the Subtitles & Timing
Open `voice-script.js`. You will find an array of objects representing your voice message:
```javascript
const voiceSubtitles = [
  { start: 3, end: 15, text: "Your text here..." },
  { start: 16, end: 28, text: "More text here..." }
];
```
- Replace the `text` property with your own transcript.
- Adjust the `start` and `end` times (in seconds) to perfectly sync the appearance of the text with your `voice.mp3`.

### 4. Change the Name & Cassette Label
Open `index.html` and look for the SVG `<text>` elements near the bottom of the file (inside the Cassette SVG group). You can change the label text (e.g., the date and recipient's initials) to whatever you prefer.

### 5. Change the Stickers
The project uses a transparent sticker image (`sticker.webp`) that randomly floats in the background to create a depth-of-field bokeh effect.
- Simply replace `sticker.webp` with any transparent PNG or WEBP image of your choice (e.g., flowers, stars, hearts).
- The JavaScript will automatically handle the scaling, blurring, and floating animations!

---

## 🚀 Deployment

Since this is a static web application built with standard HTML, CSS, and vanilla JavaScript, it can be hosted on any static file hosting service:
- **GitHub Pages** (Recommended)
- Vercel
- Netlify

Simply push the code to a repository and enable static hosting on the main branch!

## 📜 License
Feel free to fork, modify, and use this template to send a digital gift to your loved ones.
