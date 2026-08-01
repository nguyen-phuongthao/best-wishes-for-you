/* ============================================
   Time-locked Digital Gift — "Gửi đến Thảo"
   Script — State Machine & Audio
   ============================================ */

(() => {
  "use strict";

  // ── Constants ─────────────────────────────────
  const TARGET_DATE = new Date("2026-05-04T00:00:00+07:00");
  const STICKER_MIN = 10;
  const STICKER_MAX = 15;
  const BGM_DUCK_VOLUME = 0.15;
  const FADE_DURATION = 700; // ms for volume fades

  // ── DOM References ────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const stickerContainer = $("#sticker-container");
  const stateGift = $("#state-gift");
  const stateCassette = $("#state-cassette");
  const heading = $("#heading");
  const giftBox = $(".gift-box-wrapper");
  const timerEl = $("#timer");
  const btnUnlock = $("#btn-unlock");
  const lightOverlay = $("#light-overlay");
  const btnPlayPause = $("#btn-play-pause");
  const progressContainer = $(".progress-container");
  const progressBar = $("#voice-progress");
  const voiceTimeEl = $("#voice-time");
  const btnBgm = $("#btn-bgm");
  const bgmAudio = $("#bgm");
  const voiceAudio = $("#voice");

  const daysEl = $("#cd-days");
  const hoursEl = $("#cd-hours");
  const minutesEl = $("#cd-minutes");
  const secondsEl = $("#cd-seconds");

  // ── SVG Icon Helpers ──────────────────────────
  const ICON_PLAY = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="7,3 21,12 7,21"/></svg>`;
  const ICON_PAUSE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="4" height="18" rx="1"/><rect x="15" y="3" width="4" height="18" rx="1"/></svg>`;

  function speakerIcon(on) {
    if (on) {
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    }
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
  }

  // ── Utility ───────────────────────────────────
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. STICKER SPAWNING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function spawnStickers() {
    const count = Math.floor(rand(STICKER_MIN, STICKER_MAX + 1));

    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.src = "sticker.webp";
      img.alt = "";
      img.draggable = false;

      const scale = rand(0.4, 1.5);
      const opacity = rand(0.3, 0.7);
      // Depth-of-field: smaller scale → more blur (farther away)
      const blur = (1.5 - scale) * 4 + rand(0, 1.5);
      const rotation = rand(-45, 45);
      const left = rand(0, 100);
      const top = rand(0, 100);
      const duration = rand(10, 20);
      const delay = rand(-20, 0); // stagger start

      img.style.cssText = [
        `left:${left.toFixed(1)}%`,
        `top:${top.toFixed(1)}%`,
        `width:80px`,
        `height:auto`,
        `opacity:${opacity.toFixed(3)}`,
        `filter:blur(${Math.max(0, blur).toFixed(1)}px)`,
        `transform:scale(${scale.toFixed(2)}) rotate(${rotation.toFixed(0)}deg)`,
        `animation:float ${duration.toFixed(1)}s ease-in-out ${delay.toFixed(1)}s infinite alternate`,
      ].join(";");

      stickerContainer.appendChild(img);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. COUNTDOWN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let countdownId = null;

  function updateCountdown() {
    const diff = TARGET_DATE - Date.now();

    if (diff <= 0) {
      clearInterval(countdownId);
      transitionToUnlock();
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    daysEl.textContent = String(d).padStart(3, "0");
    hoursEl.textContent = String(h).padStart(2, "0");
    minutesEl.textContent = String(m).padStart(2, "0");
    secondsEl.textContent = String(s).padStart(2, "0");
  }

  function startCountdown() {
    updateCountdown();
    countdownId = setInterval(updateCountdown, 1000);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. STATE MANAGEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  function transitionToUnlock() {
    // Fade out timer, show button
    timerEl.classList.add("fade-out");
    setTimeout(() => {
      timerEl.classList.add("hidden");
      btnUnlock.classList.add("visible");
    }, 500);
  }

  // ── Particle System ────────────────────────────
  function createStarSVG(size, color) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"/></svg>`;
  }

  function createParticles(count) {
    const container = document.getElementById("particles-container");
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      const r = Math.random();
      const isStar = r > 0.85;
      const isWhite = !isStar && r > 0.55;

      particle.className = `particle ${isStar ? "particle--star" : isWhite ? "particle--white" : "particle--golden"}`;

      const angle = Math.random() * Math.PI * 2;
      const distance = 90 + Math.random() * 380;
      const size = isStar ? 10 + Math.random() * 14 : 3 + Math.random() * 10;
      const duration = 1.3 + Math.random() * 1.6;
      const delay = Math.random() * 0.7;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;

      if (isStar) {
        const starColor = Math.random() > 0.5 ? "#F0CC72" : "#FFF3D4";
        particle.innerHTML = createStarSVG(size, starColor);
      }

      particle.style.cssText = `
        --px:${endX.toFixed(0)}px;
        --py:${endY.toFixed(0)}px;
        width:${size.toFixed(0)}px;
        height:${size.toFixed(0)}px;
        animation-duration:${duration.toFixed(2)}s;
        animation-delay:${delay.toFixed(2)}s;
      `;

      container.appendChild(particle);
    }
  }

  // ── Cinematic Gift Opening ────────────────────
  function openGift() {
    // Hide button immediately
    btnUnlock.classList.add("hidden");

    // Fade heading with blur
    heading.style.transition = "opacity 1s ease, filter 1s ease";
    heading.style.opacity = "0";
    heading.style.filter = "blur(5px)";

    // Phase 1: Shake + Intensify glow (CSS driven via .opening class)
    giftBox.classList.add("opening");

    // Phase 2: Particle explosion (after ribbon starts dissolving)
    setTimeout(() => {
      createParticles(50);
    }, 1600);

    // Phase 3: Light overlay expanding flash
    setTimeout(() => {
      lightOverlay.classList.add("active");
    }, 2200);

    // Phase 4: Fade gift wrapper completely
    setTimeout(() => {
      giftBox.classList.add("fade-out");
    }, 2800);

    // Phase 5: Switch to cassette state (light is still opaque at this point)
    setTimeout(() => {
      stateGift.classList.remove("active");
      stateCassette.classList.add("active");
    }, 4200);

    // Phase 6: Clean up light + particles
    setTimeout(() => {
      lightOverlay.classList.remove("active");
      const pc = document.getElementById("particles-container");
      if (pc) pc.innerHTML = "";
    }, 5800);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. VOICE AUDIO (Cassette)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let voicePlaying = false;

  // Subtitles DOM & Loop Management
  const subtitlesContainer = $("#subtitles-container");
  let currentSubtitleIndex = -1;
  let subtitleRAF = null;

  function updateSubtitlesLoop() {
    if (!voicePlaying) return;

    const currentTime = voiceAudio.currentTime;

    if (typeof voiceSubtitles !== "undefined") {
      const activeIndex = voiceSubtitles.findIndex(
        (sub) => currentTime >= sub.start && currentTime <= sub.end
      );

      if (activeIndex === -1) {
        if (currentSubtitleIndex !== -1) {
          subtitlesContainer.innerHTML = "";
          currentSubtitleIndex = -1;
        }
      } else {
        const activeSub = voiceSubtitles[activeIndex];

        // Render word/character spans when changing subtitle line
        if (activeIndex !== currentSubtitleIndex) {
          subtitlesContainer.innerHTML = "";
          const words = activeSub.text.split(" ");
          words.forEach((w) => {
            const wordSpan = document.createElement("span");
            wordSpan.className = "subtitle-word";
            for (const char of w) {
              const charSpan = document.createElement("span");
              charSpan.className = "subtitle-char";
              charSpan.textContent = char;
              wordSpan.appendChild(charSpan);
            }
            subtitlesContainer.appendChild(wordSpan);
          });
          currentSubtitleIndex = activeIndex;
        }

        // Smooth character-by-character typing reveal
        const duration = activeSub.end - activeSub.start;
        const elapsed = currentTime - activeSub.start;
        const progress = Math.max(0, Math.min(1, elapsed / duration));

        const charEls = subtitlesContainer.querySelectorAll(".subtitle-char");
        const visibleCount = Math.floor(progress * charEls.length);

        charEls.forEach((el, i) => {
          if (i <= visibleCount) {
            el.classList.add("visible");
          } else {
            el.classList.remove("visible");
          }
        });
      }
    }

    subtitleRAF = requestAnimationFrame(updateSubtitlesLoop);
  }

  function startSubtitleLoop() {
    if (subtitleRAF) cancelAnimationFrame(subtitleRAF);
    subtitleRAF = requestAnimationFrame(updateSubtitlesLoop);
  }

  function stopSubtitleLoop() {
    if (subtitleRAF) {
      cancelAnimationFrame(subtitleRAF);
      subtitleRAF = null;
    }
  }

  function toggleVoice() {
    if (voiceAudio.paused) {
      voiceAudio.play();
      voicePlaying = true;
      btnPlayPause.innerHTML = ICON_PAUSE;
      $$(".spool").forEach((s) => s.classList.add("spinning"));
      duckBGM();
      startSubtitleLoop();
    } else {
      voiceAudio.pause();
      voicePlaying = false;
      btnPlayPause.innerHTML = ICON_PLAY;
      $$(".spool").forEach((s) => s.classList.remove("spinning"));
      unduckBGM();
      stopSubtitleLoop();
    }
  }

  voiceAudio.addEventListener("timeupdate", () => {
    if (!voiceAudio.duration) return;
    const pct = (voiceAudio.currentTime / voiceAudio.duration) * 100;
    progressBar.style.width = pct + "%";
    voiceTimeEl.textContent = formatTime(voiceAudio.currentTime);
  });

  voiceAudio.addEventListener("ended", () => {
    voicePlaying = false;
    btnPlayPause.innerHTML = ICON_PLAY;
    $$(".spool").forEach((s) => s.classList.remove("spinning"));
    progressBar.style.width = "0%";
    voiceTimeEl.textContent = "0:00";
    voiceAudio.currentTime = 0;
    stopSubtitleLoop();
    subtitlesContainer.innerHTML = "";
    currentSubtitleIndex = -1;
    unduckBGM();
  });

  // Seek
  progressContainer.addEventListener("click", (e) => {
    if (!voiceAudio.duration) return;
    const rect = progressContainer.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    voiceAudio.currentTime = ratio * voiceAudio.duration;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. BGM CONTROL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let bgmActive = false;

  function toggleBGM() {
    if (!bgmActive) {
      bgmAudio.volume = voicePlaying ? BGM_DUCK_VOLUME : 1;
      bgmAudio
        .play()
        .then(() => {
          bgmActive = true;
          btnBgm.classList.remove("muted");
          btnBgm.innerHTML = speakerIcon(true);
        })
        .catch(() => {
          // Autoplay blocked — user must interact again
        });
    } else {
      bgmAudio.pause();
      bgmActive = false;
      btnBgm.classList.add("muted");
      btnBgm.innerHTML = speakerIcon(false);
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. AUDIO DUCKING (smooth volume fade)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let fadeRAF = null;

  function fadeVolume(target, duration) {
    if (fadeRAF) cancelAnimationFrame(fadeRAF);
    duration = duration || FADE_DURATION;

    const startVol = bgmAudio.volume;
    const delta = target - startVol;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      bgmAudio.volume = Math.max(0, Math.min(1, startVol + delta * eased));

      if (progress < 1) {
        fadeRAF = requestAnimationFrame(step);
      } else {
        fadeRAF = null;
      }
    }

    fadeRAF = requestAnimationFrame(step);
  }

  function duckBGM() {
    if (bgmActive) fadeVolume(BGM_DUCK_VOLUME);
  }

  function unduckBGM() {
    if (bgmActive) fadeVolume(1);
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. EVENT LISTENERS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const btnReplay = $("#btn-replay");
  btnUnlock.addEventListener("click", openGift);
  btnPlayPause.addEventListener("click", toggleVoice);
  btnReplay.addEventListener("click", () => {
    voiceAudio.currentTime = 0;
    if (voiceAudio.paused) {
      toggleVoice();
    }
  });
  btnBgm.addEventListener("click", toggleBGM);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. INIT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  window.addEventListener("load", () => {
    spawnStickers();

    // Set initial BGM button state
    btnBgm.innerHTML = speakerIcon(false);
    btnBgm.classList.add("muted");

    // Set initial play button
    btnPlayPause.innerHTML = ICON_PLAY;

    // Determine initial state
    if (Date.now() >= TARGET_DATE.getTime()) {
      transitionToUnlock();
    } else {
      startCountdown();
    }
  });
})();
