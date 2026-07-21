// ===== WEDDING INVITATION — MAIN JAVASCRIPT =====

(function () {
  'use strict';

  // ========== DOM REFERENCES ==========

  const landingSection = document.getElementById('landingSection');
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const envelope = document.getElementById('envelope');
  const envelopeFlap = document.getElementById('envelopeFlap');
  const envelopeCard = document.getElementById('envelopeCard');
  const waxSeal = document.getElementById('waxSeal');
  const tapText = document.getElementById('tapText');
  const sealParticles = document.getElementById('sealParticles');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const mainContent = document.getElementById('mainContent');
  const musicToggle = document.getElementById('musicToggle');
  const particlesCanvas = document.getElementById('particles-canvas');

  const wishesForm = document.getElementById('wishesForm');
  const wishesList = document.getElementById('wishesList');

  // ========== STATE ==========
  let envelopeOpened = false;
  let musicPlaying = false;



  // ========== PARTICLE SYSTEM ==========
  const ctx = particlesCanvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    particlesCanvas.width = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * particlesCanvas.width;
      this.y = Math.random() * particlesCanvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.hue = 38 + Math.random() * 20;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity += this.fadeDirection * this.fadeSpeed;

      if (this.opacity >= 0.6) this.fadeDirection = -1;
      if (this.opacity <= 0.05) this.fadeDirection = 1;

      if (this.x < 0 || this.x > particlesCanvas.width ||
          this.y < 0 || this.y > particlesCanvas.height) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 55%, 60%, ${this.opacity})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 55%, 60%, ${this.opacity * 0.15})`;
      ctx.fill();
    }
  }

  function initParticles() {
    resizeCanvas();
    const count = Math.min(60, Math.floor(window.innerWidth * window.innerHeight / 15000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
    animateParticles();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', resizeCanvas);
  initParticles();

  // =====================================================
  // CINEMATIC ENVELOPE OPENING ANIMATION
  // Sequence:
  //   0. Tap → haptic buzz + screen shake + golden flash
  //   1. Seal shatters → fragments fly with physics + sparkle ring
  //   2. Flap opens → smooth 3D flip with depth shadow
  //   3. Card rises → floats up with glow + wobble
  //   4. Card holds → subtle breathing pulse
  //   5. Scroll prompt → animated arrow
  //   6. Card expands → fullscreen blur transition
  //   7. Fade & reveal → main content + confetti + petals
  // =====================================================

  const screenFlash = document.getElementById('screenFlash');
  const envelopeShake = document.getElementById('envelopeShake');

  waxSeal.addEventListener('click', handleSealTap);
  waxSeal.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleSealTap();
  });

  envelopeWrapper.addEventListener('click', (e) => {
    if (!e.target.closest('.wax-seal')) {
      handleSealTap();
    }
  });

  let scrollTriggered = false;
  let touchStartY = 0;

  // --- Haptic feedback ---
  function hapticFeedback(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern || [15, 30, 15]);
    }
  }

  // --- Screen flash ---
  function flashScreen(color, duration) {
    if (!screenFlash) return;
    screenFlash.style.background = color || 'rgba(201, 169, 110, 0.35)';
    screenFlash.style.opacity = '1';
    screenFlash.style.transition = 'opacity ' + (duration || 0.6) + 's ease-out';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        screenFlash.style.opacity = '0';
      });
    });
  }

  // --- Screen shake ---
  function shakeScreen(intensity, duration) {
    if (!envelopeShake) return;
    const frames = [
      { transform: 'translate(0, 0)' },
      { transform: `translate(${-intensity}px, ${intensity * 0.5}px)` },
      { transform: `translate(${intensity}px, ${-intensity * 0.7}px)` },
      { transform: `translate(${-intensity * 0.5}px, ${intensity * 0.3}px)` },
      { transform: `translate(${intensity * 0.3}px, ${-intensity * 0.5}px)` },
      { transform: 'translate(0, 0)' },
    ];
    envelopeShake.animate(frames, {
      duration: duration || 400,
      easing: 'ease-out',
    });
  }

  // --- Play a click/crack sound via Web Audio ---
  function playCrackSound() {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = ac.sampleRate * 0.15;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 8);
      }
      const source = ac.createBufferSource();
      source.buffer = buffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 1.5;
      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.18, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      source.start();
      source.onended = () => ac.close();
    } catch (e) {}
  }

  // --- Main handler ---
  function handleSealTap() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    envelopeWrapper.style.cursor = 'default';
    envelopeWrapper.style.transform = 'scale(1)';

    // Start music on seal tap
    startMusic();

    // PHASE 0: Instant feedback
    hapticFeedback([20, 40, 10, 30, 15]);
    shakeScreen(6, 350);
    flashScreen('rgba(201, 169, 110, 0.3)', 0.7);
    playCrackSound();

    // PHASE 1: Seal shatters (0ms)
    shatterSeal();

    // PHASE 2: Flap opens (500ms)
    setTimeout(() => openFlap(), 500);

    // PHASE 3: Card rises (1600ms)
    setTimeout(() => riseCard(), 1600);

    // PHASE 4: Prompt scroll (3200ms)
    setTimeout(() => enableScrollTrigger(), 3200);
  }

  // --- PHASE 1: Seal shatter ---
  function shatterSeal() {
    tapText.classList.add('hidden');

    // Glow burst ring
    const ring = document.createElement('div');
    ring.classList.add('seal-glow-ring');
    sealParticles.appendChild(ring);
    setTimeout(() => ring.remove(), 800);

    // Spawn physics fragments
    createShatterFragments();

    // Seal break animation
    waxSeal.classList.add('breaking');
  }

  function createShatterFragments() {
    const colors = ['#8b2040', '#6b1830', '#a83252', '#c9a96e', '#e8d5a8', '#d4a84b'];
    const fragCount = 28;

    for (let i = 0; i < fragCount; i++) {
      const frag = document.createElement('div');
      frag.classList.add('seal-fragment');

      const angle = (Math.PI * 2 * i) / fragCount + (Math.random() - 0.5) * 0.8;
      const velocity = 80 + Math.random() * 120;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 40;
      const rot = (Math.random() - 0.5) * 720;
      const size = 2 + Math.random() * 6;

      frag.style.width = size + 'px';
      frag.style.height = size * (0.6 + Math.random() * 0.8) + 'px';
      frag.style.background = colors[Math.floor(Math.random() * colors.length)];
      frag.style.borderRadius = Math.random() > 0.4 ? '50%' : '1px';
      frag.style.left = '0px';
      frag.style.top = '0px';
      frag.style.boxShadow = '0 0 4px ' + colors[Math.floor(Math.random() * colors.length)];

      sealParticles.appendChild(frag);

      const dur = 600 + Math.random() * 400;
      frag.animate([
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: `translate(${vx}px, ${vy}px) rotate(${rot}deg) scale(0.3)`, opacity: 0 },
      ], {
        duration: dur,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards',
      });

      setTimeout(() => frag.remove(), dur);
    }

    // Sparkle trail particles (gold, smaller, longer life)
    for (let i = 0; i < 12; i++) {
      const sp = document.createElement('div');
      sp.classList.add('seal-sparkle');
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 50;
      sp.style.left = '0px';
      sp.style.top = '0px';
      sealParticles.appendChild(sp);

      sp.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 },
      ], {
        duration: 500 + Math.random() * 300,
        easing: 'ease-out',
        fill: 'forwards',
      });

      setTimeout(() => sp.remove(), 900);
    }
  }

  // --- PHASE 2: Flap opens ---
  function openFlap() {
    hapticFeedback([10]);
    envelopeFlap.classList.add('open');
    // Change z-index after the flap is halfway open (600ms of the 1200ms transition)
    setTimeout(() => {
      envelopeFlap.style.zIndex = '1';
    }, 600);
  }

  // --- PHASE 3: Card rises ---
  function riseCard() {
    hapticFeedback([8, 20, 8]);
    envelopeCard.classList.add('rising');
  }

  // --- PHASE 4: Reveal main content directly ---
  function enableScrollTrigger() {
    const textEl = scrollIndicator.querySelector('.scroll-indicator-text');
    if (textEl) textEl.textContent = 'Scroll or tap to view invitation';
    scrollIndicator.classList.add('visible');

    window.addEventListener('scroll', handleScrollTrigger, { passive: true });
    window.addEventListener('wheel', handleWheelTrigger, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchTrigger, { passive: true });
    window.addEventListener('click', handleScrollTrigger);

    document.body.style.overflow = 'auto';
  }

  function handleScrollTrigger() {
    triggerExpandAndReveal();
  }

  function handleWheelTrigger(e) {
    if (e.deltaY > 5) triggerExpandAndReveal();
  }

  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchTrigger(e) {
    const diffY = touchStartY - e.touches[0].clientY;
    if (diffY > 10) triggerExpandAndReveal();
  }

  function triggerExpandAndReveal() {
    if (scrollTriggered) return;
    scrollTriggered = true;

    window.removeEventListener('scroll', handleScrollTrigger);
    window.removeEventListener('wheel', handleWheelTrigger);
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchTrigger);
    window.removeEventListener('click', handleScrollTrigger);

    scrollIndicator.classList.remove('visible');
    hapticFeedback([12]);

    landingSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    landingSection.style.opacity = '0';
    landingSection.style.transform = 'scale(1.04)';

    setTimeout(() => {
      mainContent.classList.add('revealed');

      // Immediately activate all hero section reveal elements so text & couple image are visible with the confetti
      const heroSection = document.getElementById('heroSection');
      if (heroSection) {
        const heroReveals = heroSection.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        heroReveals.forEach(el => el.classList.add('active'));
      }

      startFloatingPetals();
      createConfetti();

      const textEl = scrollIndicator.querySelector('.scroll-indicator-text');
      if (textEl) textEl.textContent = 'Scroll Down';
      scrollIndicator.classList.add('visible');
    }, 250);

    setTimeout(() => {
      landingSection.classList.add('hide');
      document.body.style.overflow = 'auto';
    }, 850);
  }

  // ========== CONFETTI ==========
  function createConfetti() {
    const colors = ['#c9a96e', '#e8d5a8', '#c77d8a', '#f0d5d5', '#6b2040', '#faf3e8'];
    const shapes = ['circle', 'square', 'triangle'];

    for (let i = 0; i < 80; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti-piece');
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 4 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';

      if (shape === 'square') {
        confetti.style.borderRadius = '2px';
      } else if (shape === 'triangle') {
        confetti.style.borderRadius = '0';
        confetti.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
      }

      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }
  }

  // ========== FLOATING PETALS ==========
  function startFloatingPetals() {
    function createPetal() {
      const petal = document.createElement('div');
      petal.classList.add('petal');

      const size = Math.random() * 12 + 6;
      petal.style.width = size + 'px';
      petal.style.height = size * 0.7 + 'px';
      petal.style.left = Math.random() * 100 + '%';
      petal.style.borderRadius = '50% 0 50% 0';

      const hue = Math.random() > 0.5 ? '350' : '30';
      const lightness = Math.random() * 20 + 70;
      petal.style.background = `hsla(${hue}, 60%, ${lightness}%, 0.6)`;
      petal.style.animationDuration = Math.random() * 6 + 8 + 's';
      petal.style.animationDelay = Math.random() * 2 + 's';

      document.body.appendChild(petal);
      setTimeout(() => petal.remove(), 16000);
    }

    setInterval(createPetal, 3000);
    for (let i = 0; i < 5; i++) {
      setTimeout(createPetal, i * 400);
    }
  }

  // ========== SCROLL REVEAL ANIMATIONS ==========
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Hide scroll indicator when user scrolls
  let scrollListenerAdded = false;
  function handleScroll() {
    if (window.scrollY > 100) {
      scrollIndicator.classList.remove('visible');
    }
  }

  const contentObserver = new MutationObserver(() => {
    if (mainContent.classList.contains('revealed') && !scrollListenerAdded) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      scrollListenerAdded = true;
    }
  });

  contentObserver.observe(mainContent, { attributes: true, attributeFilter: ['class'] });

  // ========== COUNTDOWN TIMER ==========
  const weddingDate = new Date('2026-08-23T04:30:00');

  function updateCountdown() {
    const now = new Date();
    const diff = weddingDate - now;

    if (diff <= 0) {
      document.getElementById('countDays').textContent = '🎉';
      document.getElementById('countHours').textContent = '🎉';
      document.getElementById('countMinutes').textContent = '🎉';
      document.getElementById('countSeconds').textContent = '🎉';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    animateNumber(document.getElementById('countDays'), days);
    animateNumber(document.getElementById('countHours'), hours);
    animateNumber(document.getElementById('countMinutes'), minutes);
    animateNumber(document.getElementById('countSeconds'), seconds);
  }

  function animateNumber(el, newValue) {
    const formatted = String(newValue).padStart(2, '0');
    if (el.textContent !== formatted) {
      el.style.transform = 'translateY(-4px)';
      el.style.opacity = '0.5';
      setTimeout(() => {
        el.textContent = formatted;
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, 150);
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ========== MUSIC (HTML Audio Element) ==========
  const bgMusic = document.getElementById('bgMusic');
  let musicStarted = false;

  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    bgMusic.volume = 0.5;
    bgMusic.muted = false; // ensure not muted
    bgMusic.play().then(() => {
      musicToggle.classList.add('playing');
      musicToggle.classList.remove('muted');
    }).catch(err => {
      console.log("Audio play blocked or failed:", err);
      musicStarted = false; // reset so we can try again
    });
  }

  // Toggle mute / unmute on button click
  musicToggle.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent bubbling to document
    if (!musicStarted) {
      startMusic();
      return;
    }
    
    bgMusic.muted = !bgMusic.muted;
    if (bgMusic.muted) {
      musicToggle.classList.remove('playing');
      musicToggle.classList.add('muted');
    } else {
      musicToggle.classList.add('playing');
      musicToggle.classList.remove('muted');
      if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
      }
    }
  });

  // Start music on first click/tap anywhere on the page
  const handleFirstInteraction = () => {
    startMusic();
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  };
  document.addEventListener('click', handleFirstInteraction);
  document.addEventListener('touchstart', handleFirstInteraction);


  // ========== WISHES API + PAGINATION ==========
  const wishesPerPage = 6;
  let currentPage = 1;
  let totalPages = 1;
  let wishesData = [];

  const wishesPagination = document.getElementById('wishesPagination');
  const prevBtn = document.getElementById('wishesPrev');
  const nextBtn = document.getElementById('wishesNext');
  const pageInfo = document.getElementById('wishesPageInfo');
  const wishesLoading = document.getElementById('wishesLoading');
  const wishesEmpty = document.getElementById('wishesEmpty');
  const wishesSendBtn = document.getElementById('wishesSendBtn');

  async function fetchWishes(page) {
    wishesLoading.style.display = 'flex';
    wishesEmpty.style.display = 'none';
    wishesList.innerHTML = '';

    try {
      const res = await fetch(`/api/wishes?page=${page}&limit=${wishesPerPage}&t=${Date.now()}`);
      const data = await res.json();

      wishesData = data.wishes || [];
      totalPages = data.pagination.totalPages || 1;
      currentPage = data.pagination.page || 1;

      renderWishes();
      updatePaginationControls();
    } catch (err) {
      wishesLoading.style.display = 'none';
      wishesEmpty.style.display = 'block';
      wishesEmpty.textContent = 'Unable to load wishes. Please try again.';
    }
  }

  function renderWishes() {
    wishesLoading.style.display = 'none';
    wishesList.innerHTML = '';

    if (wishesData.length === 0) {
      wishesEmpty.style.display = 'block';
      wishesEmpty.textContent = 'Be the first to send your wishes!';
      return;
    }

    wishesEmpty.style.display = 'none';

    wishesData.forEach((wish, index) => {
      const wishCard = document.createElement('div');
      wishCard.classList.add('wish-card');
      wishCard.innerHTML = `
        <p class="wish-author">${escapeHtml(wish.name)}</p>
        <p class="wish-text">"${escapeHtml(wish.message)}"</p>
        <p class="wish-time">${formatWishTime(wish.timestamp)}</p>
      `;

      wishCard.style.opacity = '0';
      wishCard.style.transform = 'translateY(20px)';
      wishesList.appendChild(wishCard);

      setTimeout(() => {
        wishCard.style.transition = 'all 0.6s ease';
        wishCard.style.opacity = '1';
        wishCard.style.transform = 'translateY(0)';
      }, index * 80);
    });
  }

  function formatWishTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function updatePaginationControls() {
    if (totalPages <= 1) {
      wishesPagination.style.display = 'none';
      return;
    }

    wishesPagination.style.display = 'flex';
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchWishes(currentPage);
      scrollToWishes();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchWishes(currentPage);
      scrollToWishes();
    }
  });

  function scrollToWishes() {
    const section = document.getElementById('wishesSection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  wishesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('wishName').value.trim();
    const message = document.getElementById('wishMessage').value.trim();

    if (!name || !message) return;

    wishesSendBtn.disabled = true;
    wishesSendBtn.textContent = 'Sending...';

    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      });

      if (!res.ok) throw new Error('Failed to send');

      const responseData = await res.json();
      const newWish = responseData.wish;

      document.getElementById('wishName').value = '';
      document.getElementById('wishMessage').value = '';

      // Optimistically update the UI instantly
      if (newWish) {
        wishesData.unshift(newWish);
        if (wishesData.length > wishesPerPage) {
          wishesData = wishesData.slice(0, wishesPerPage);
        }
        renderWishes();
        
        // Sync database in background after a short delay
        setTimeout(() => {
          fetchWishes(1);
        }, 1200);
      } else {
        currentPage = 1;
        await fetchWishes(1);
      }
    } catch (err) {
      alert('Failed to send wish. Please try again.');
    } finally {
      wishesSendBtn.disabled = false;
      wishesSendBtn.textContent = 'Send Wishes ✨';
    }
  });

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initial fetch
  fetchWishes(1);

  // ========== PARALLAX ON SCROLL ==========
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const hero = document.getElementById('heroSection');
        if (hero) {
          const heroRect = hero.getBoundingClientRect();
          if (heroRect.top < window.innerHeight && heroRect.bottom > 0) {
            const heroImg = hero.querySelector('.hero-floral-top');
            if (heroImg) {
              heroImg.style.transform = `translateY(${scrollY * 0.1}px)`;
            }
          }
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ========== COUNTDOWN POP ANIMATION ==========
  const countdownSection = document.getElementById('countdownSection');
  const countdownObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.countdown-item').forEach((item, index) => {
          setTimeout(() => {
            item.style.transform = 'translateY(-8px)';
            setTimeout(() => {
              item.style.transform = 'translateY(0)';
            }, 300);
          }, index * 100);
        });
        countdownObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  countdownObserver.observe(countdownSection);

  // ========== TOUCH RIPPLE EFFECT ==========
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, .event-map-btn');
    if (!target) return;

    const ripple = document.createElement('span');
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(201, 169, 110, 0.2);
      transform: scale(0);
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
      z-index: 1;
    `;

    target.style.position = target.style.position || 'relative';
    target.style.overflow = 'hidden';
    target.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });

  // Add ripple keyframes
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    @keyframes rippleEffect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(rippleStyle);

})();
