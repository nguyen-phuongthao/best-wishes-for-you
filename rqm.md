# Role and Objective

You are an Expert Frontend Developer & UI/UX Designer. Build a single-page static website that acts as a "Time-locked Digital Gift". It counts down to a target date (May 4, 2027, GMT+7). Upon reaching the date, the user can "unpack" the gift to reveal a cassette tape player playing a voice message.

# Tech Stack & Constraints

- Pure HTML5, CSS3, and Vanilla JavaScript. Single `index.html`, `style.css`, and `script.js`.
- Responsive layout prioritizing iPhone 13 (approx. 390x844). Use `height: 100dvh`, `width: 100vw`, and `overflow: hidden`. Everything centered via Flexbox/Grid.
- Output clean, maintainable code without extraneous modifications.
- Font must be friendly with Vietnamese.

# Aesthetic & Visual Design

- **Theme:** Cinematic, dreamy, 35mm editorial film look, nostalgic and warm.
- **Background:** Soft warm cream (#FDFBF7).
- **Vignette & Grain:** Apply a CSS radial-gradient overlay to darken the edges (vignette), and a CSS-based SVG noise/grain overlay (pointer-events: none) to simulate film grain.

# The Background Sticker Logic

- The user provides an image named `sticker.webp`.
- **Dynamic Spawning:** On window load, use JavaScript to dynamically generate 10-15 `<img>` elements of `sticker.webp` appended to a fixed background container (`z-index: -1`).
- **Depth of Field (Photographic effect):** Randomize their inline styles:
  - `left` and `top` (0% to 100%).
  - `transform: scale()` (from 0.4 to 1.5).
  - `opacity` (from 0.05 to 0.15 for subtle blending).
  - `filter: blur()` (smaller scales should have more blur, e.g., 2px to 6px, simulating out-of-focus bokeh).
  - `transform: rotate()` (-45deg to 45deg).
- **Animation:** Add a smooth, infinite, alternating CSS `@keyframes` animation so they float gently up and down (Y-axis translation) over 10-20 seconds.

# State Management

**State 1: Countdown (Current Date < 2027-05-04T00:00:00+07:00)**

- Top text: "Gửi đến Thảo của những năm về sau..." (Elegant Serif, elegant fade-in).
- Center: SVG static gift box wrapped with ribbon. Add a subtle glowing drop-shadow.
- Bottom: Minimalist timer `[Days] : [Hours] : [Minutes] : [Seconds]`.
- Minimal volume toggle for background music (BGM).

**State 2: Unlocking (Cinematic Opening Sequence)**

- When target date is reached, timer fades out and is replaced by a glowing "Mở Quà" button with a pulsing box-shadow animation.
- Click triggers a multi-phase cinematic transition:
  1. **Shake & Intensify** (0–0.9s): Gift box trembles (CSS shake keyframe) while the golden drop-shadow glow intensifies dramatically.
  2. **Ribbon Shimmer Dissolve** (0.7–1.7s): The bow and ribbon elements float upward, blur, and brighten (shimmer effect via `filter: brightness()` + `blur()`) before fading out.
  3. **Lid Dramatic Rise** (1.3–2.4s): The lid lifts high with a wide rotation and blurs as it disappears (cubic-bezier easing for a weighty feel).
  4. **Golden Particle Explosion** (1.6–3.5s): JavaScript dynamically spawns ~50 particles (mix of golden orbs, white sparkles, and SVG star shapes) that burst outward from center with randomized trajectories, sizes, and timing.
  5. **Warm Light Flash** (2.2–5.8s): A circular radial-gradient overlay (warm golden → white) expands from center to fill the entire screen. While the screen is fully opaque, the DOM switches from the gift state to the cassette state. The light then fades away to reveal the cassette tape.

**State 3: The Cassette**

- Center: Highly detailed SVG flat-design Cassette Tape.
- Label text on cassette: "Tháng 8, 2026" (Handwritten font style).
- **Audio Logic:**
  - Central Play/Pause button for `voice.mp3`.
  - Simple CSS progress bar mapping to voice audio duration.
  - While playing, the two inner spools (gears) of the SVG cassette MUST rotate infinitely via CSS keyframes.
- **Audio Ducking:** When voice audio plays, JS must smoothly fade BGM volume down to 15%. When voice pauses/ends, BGM volume fades back up to 100%.
