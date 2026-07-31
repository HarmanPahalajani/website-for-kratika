(function () {
  const config = window.AURORA_CONFIG || {};
  const loadingScreen = document.getElementById('loadingScreen');
  const introStage = document.getElementById('introStage');
  const siteMain = document.getElementById('siteMain');
  const beginJourneyBtn = document.getElementById('beginJourneyBtn');
  const replayButtons = [document.getElementById('replayBtn'), document.getElementById('replayBottomBtn')];
  const envelopeButton = document.querySelector('.envelope-button');
  const giftButton = document.querySelector('.gift-button');
  const voiceButton = document.querySelector('.voice-button');
  const cinemaVideo = document.querySelector('.cinema-video');
  const cinemaPlayButton = document.querySelector('.cinema-play-button');
  const cinemaStage = document.querySelector('.cinema-stage');
  const letterOverlay = document.getElementById('letterOverlay');
  const letterCloseBtn = document.getElementById('letterCloseBtn');
  const galleryOverlay = document.getElementById('galleryOverlay');
  const galleryCloseBtn = document.getElementById('galleryCloseBtn');
  const galleryImage = document.getElementById('galleryImage');
  const polaroids = Array.from(document.querySelectorAll('.polaroid'));
  const audioState = {
    background: new Audio('assets/audios/background.mp3'),
    click: new Audio('assets/audios/click.mp3'),
    gift: new Audio('assets/audios/gift.mp3'),
    unlock: new Audio('assets/audios/unlock.mp3')
  };
  let galleryIndex = 0;

  function playSound(name) {
    const audio = audioState[name];
    if (!audio || config.audio?.enabled === false) {
      return;
    }

    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function playBackgroundAudio() {
    const audio = audioState.background;
    if (!audio || config.audio?.enabled === false) {
      return;
    }

    audio.loop = true;
    audio.volume = 0.18;
    audio.play().catch(() => {});
  }

  function openLetterOverlay() {
    closeGalleryOverlay();
    if (letterOverlay) {
      letterOverlay.hidden = false;
    }
    playSound('unlock');
  }

  function closeLetterOverlay() {
    if (letterOverlay) {
      letterOverlay.hidden = true;
    }
  }

  function openGalleryOverlay(index) {
    closeLetterOverlay();
    if (!galleryOverlay || !galleryImage || !polaroids.length) {
      return;
    }

    const imageSrc = polaroids[index]?.dataset?.image;
    if (!imageSrc) {
      return;
    }

    galleryIndex = index;
    galleryImage.src = imageSrc;
    galleryImage.alt = `Gallery memory ${index + 1}`;
    galleryOverlay.hidden = false;
    playSound('click');
  }

  function cycleGalleryImage() {
    if (!galleryOverlay || !galleryOverlay.hidden || !polaroids.length) {
      return;
    }
    const nextIndex = (galleryIndex + 1) % polaroids.length;
    openGalleryOverlay(nextIndex);
  }

  function closeGalleryOverlay() {
    if (galleryOverlay) {
      galleryOverlay.hidden = true;
    }
  }

  function revealOnScroll() {
    const items = Array.from(document.querySelectorAll('.reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    items.forEach((item) => observer.observe(item));
  }

  function showMainContent() {
    if (loadingScreen) {
      loadingScreen.classList.add('is-hidden');
    }
    if (introStage) {
      introStage.classList.add('is-hidden');
    }
    if (siteMain) {
      siteMain.hidden = false;
      siteMain.classList.add('is-ready');
    }
  }

  function startLoading() {
    if (!loadingScreen) {
      return;
    }
    window.setTimeout(() => {
      loadingScreen.classList.add('is-hidden');
      if (introStage) {
        introStage.classList.remove('is-hidden');
      }
      if (siteMain) {
        siteMain.hidden = false;
      }
    }, config.timings?.loadingDuration || 2200);
  }

  function beginStory() {
    if (introStage) {
      introStage.classList.add('is-hidden');
    }
    showMainContent();
    document.body.classList.add('story-started');
    playBackgroundAudio();
    playSound('click');
  }

  function replayStory() {
    document.body.classList.remove('story-started');
    if (introStage) {
      introStage.classList.remove('is-hidden');
    }
    if (siteMain) {
      siteMain.hidden = true;
      siteMain.classList.remove('is-ready');
    }
    if (loadingScreen) {
      loadingScreen.classList.remove('is-hidden');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    playSound('click');
    window.setTimeout(() => {
      beginStory();
    }, 400);
  }

  function attachInteractions() {
    if (beginJourneyBtn) {
      beginJourneyBtn.addEventListener('click', beginStory);
    }
 
    replayButtons.forEach((button) => {
      if (button) {
        button.addEventListener('click', replayStory);
      }
    });

    if (envelopeButton) {
      envelopeButton.addEventListener('click', () => {
        envelopeButton.classList.add('is-open');
        openLetterOverlay();
      });
    }

    if (giftButton) {
      giftButton.addEventListener('click', () => {
        giftButton.classList.add('is-open');
        playSound('gift');
        if (window.AuroraEffects?.launchConfetti) {
          window.AuroraEffects.launchConfetti();
        }
      });
    }

    if (voiceButton) {
      voiceButton.addEventListener('click', () => {
        voiceButton.classList.toggle('is-playing');
      });
    }

    if (cinemaVideo && cinemaPlayButton && cinemaStage) {
      const setPlayOverlayVisible = (visible) => {
        cinemaPlayButton.style.opacity = visible ? '1' : '0';
        cinemaPlayButton.style.pointerEvents = visible ? 'auto' : 'none';
      };

      const handleViewport = () => {
        const rect = cinemaStage.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (!isVisible && !cinemaVideo.paused) {
          cinemaVideo.pause();
        }
      };

      cinemaPlayButton.addEventListener('click', () => {
        cinemaVideo.play().catch(() => {});
        setPlayOverlayVisible(false);
      });

     cinemaVideo.addEventListener('play', () => {
    setPlayOverlayVisible(false);

    if (!audioState.background.paused) {
        audioState.background.pause();
    }
});

      cinemaVideo.addEventListener('pause', () => {
    setPlayOverlayVisible(true);

    if (audioState.background.paused) {
        audioState.background.play().catch(() => {});
    }
});
      cinemaVideo.addEventListener('ended', () => {
    setPlayOverlayVisible(true);

    if (audioState.background.paused) {
        audioState.background.play().catch(() => {});
    }
});

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && !cinemaVideo.paused) {
            cinemaVideo.pause();
          }
        });
      }, { threshold: 0.25 });

      observer.observe(cinemaStage);
      document.addEventListener('scroll', handleViewport, { passive: true });
      window.addEventListener('resize', handleViewport, { passive: true });
      handleViewport();
      setPlayOverlayVisible(true);
    }

    const memoryVideos = Array.from(document.querySelectorAll('.memory-video'));
    const memoryVideoPlays = Array.from(document.querySelectorAll('.memory-video-play'));
    
    memoryVideoPlays.forEach((button, index) => {
      const video = memoryVideos[index];
      if (!video) return;

      const setPlayVisible = (visible) => {
        button.style.opacity = visible ? '1' : '0';
        button.style.pointerEvents = visible ? 'auto' : 'none';
      };

      button.addEventListener('click', () => {
        video.play().catch(() => {});
        setPlayVisible(false);
      });

      video.addEventListener('play', () => {
        setPlayVisible(false);
      });

      video.addEventListener('pause', () => {
        setPlayVisible(true);
      });

      video.addEventListener('ended', () => {
        setPlayVisible(true);
      });

      setPlayVisible(true);
    });

    if (letterCloseBtn) {
      letterCloseBtn.addEventListener('click', closeLetterOverlay);
    }

    if (letterOverlay) {
      letterOverlay.addEventListener('click', (event) => {
        if (event.target === letterOverlay) {
          closeLetterOverlay();
        }
      });
    }

    if (galleryCloseBtn) {
      galleryCloseBtn.addEventListener('click', closeGalleryOverlay);
    }

    if (galleryOverlay) {
      galleryOverlay.addEventListener('click', (event) => {
        if (event.target === galleryOverlay) {
          const nextIndex = (galleryIndex + 1) % polaroids.length;
          openGalleryOverlay(nextIndex);
        }
      });
    }

    polaroids.forEach((polaroid, index) => {
      polaroid.addEventListener('click', () => {
        openGalleryOverlay(index);
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeLetterOverlay();
        closeGalleryOverlay();
      }
    });

    document.addEventListener('scroll', () => {
      const offset = window.scrollY * (config.timings?.parallaxStrength || 0.08);
      document.documentElement.style.setProperty('--parallax', `${offset}px`);
    }, { passive: true });
  }

  function init() {
    startLoading();
    revealOnScroll();
    attachInteractions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
/* ===== Floating Hearts ===== */

function createFloatingHeart() {
    const heart = document.createElement("div");
    heart.className = "floating-heart";
    heart.innerHTML = "♥";

    heart.style.left = Math.random() * 100 + "vw";
    heart.style.fontSize = (10 + Math.random() * 8) + "px";
    heart.style.animationDuration = (7 + Math.random() * 4) + "s";
    heart.style.opacity = (0.25 + Math.random() * 0.35).toFixed(2);

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 12000);
}

setInterval(createFloatingHeart, 1200);
