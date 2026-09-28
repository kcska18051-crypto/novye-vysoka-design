(() => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  document.documentElement.classList.add('motion-ready');

  const reveals = [...document.querySelectorAll('.reveal')];
  const showAllReveals = () => reveals.forEach((item) => item.classList.add('is-visible'));
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    showAllReveals();
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((item) => revealObserver.observe(item));
  }

  reduceMotion.addEventListener?.('change', (event) => {
    if (event.matches) showAllReveals();
  });

  const placeGallery = document.querySelector('[data-place-gallery]');
  if (placeGallery) {
    const placeButtons = [...placeGallery.querySelectorAll('[data-place]')];
    const placePanels = [...placeGallery.querySelectorAll('[data-place-panel]')];
    const selectPlace = (name) => {
      placeButtons.forEach((button) => {
        const active = button.dataset.place === name;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      placePanels.forEach((panel) => {
        const active = panel.dataset.placePanel === name;
        panel.classList.toggle('is-active', active);
        panel.setAttribute('aria-hidden', String(!active));
      });
    };
    placeButtons.forEach((button) => button.addEventListener('click', () => selectPlace(button.dataset.place)));
  }

  const journeyTrack = document.querySelector('[data-journey-track]');
  const journeyTabs = [...document.querySelectorAll('.journey-tab[data-scene]')];
  const journeyPanels = [...document.querySelectorAll('.journey-panel[data-scene]')];
  const journeyCurrent = document.querySelector('[data-journey-current]');
  const journeyProgress = document.querySelector('[data-journey-progress]');
  let journeyIndex = 0;
  let journeyFrame = 0;

  const activateScene = (index, { scrollMobile = false, focusTab = false } = {}) => {
    if (!journeyPanels.length) return;
    journeyIndex = Math.max(0, Math.min(index, journeyPanels.length - 1));
    journeyTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === journeyIndex;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    journeyPanels.forEach((panel, panelIndex) => {
      const active = panelIndex === journeyIndex;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-expanded', String(active));
    });
    if (journeyCurrent) journeyCurrent.textContent = String(journeyIndex + 1);
    if (journeyProgress) journeyProgress.style.transform = `translateX(${journeyIndex * 100}%)`;
    if (focusTab) journeyTabs[journeyIndex]?.focus({ preventScroll: true });
    if (scrollMobile && mobile.matches && journeyTrack) {
      const firstPanelLeft = journeyPanels[0]?.offsetLeft || 0;
      const targetLeft = (journeyPanels[journeyIndex]?.offsetLeft || 0) - firstPanelLeft;
      journeyTrack.scrollTo({
        left: targetLeft,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });
    }
  };

  journeyTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateScene(index, { scrollMobile: true }));
    tab.addEventListener('keydown', (event) => {
      const keys = {
        ArrowLeft: Math.max(0, journeyIndex - 1),
        ArrowRight: Math.min(journeyPanels.length - 1, journeyIndex + 1),
        Home: 0,
        End: journeyPanels.length - 1
      };
      if (!(event.key in keys)) return;
      event.preventDefault();
      activateScene(keys[event.key], { scrollMobile: true, focusTab: true });
    });
  });

  journeyPanels.forEach((panel, index) => {
    panel.addEventListener('click', () => activateScene(index, { scrollMobile: true }));
  });

  const syncJourneyFromScroll = () => {
    if (!journeyTrack || !mobile.matches) return;
    cancelAnimationFrame(journeyFrame);
    journeyFrame = requestAnimationFrame(() => {
      const trackLeft = journeyTrack.getBoundingClientRect().left;
      let closestIndex = 0;
      let closestDistance = Infinity;
      journeyPanels.forEach((panel, index) => {
        const distance = Math.abs(panel.getBoundingClientRect().left - trackLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      if (closestIndex !== journeyIndex) activateScene(closestIndex);
    });
  };
  journeyTrack?.addEventListener('scroll', syncJourneyFromScroll, { passive: true });
  mobile.addEventListener?.('change', () => activateScene(journeyIndex));
  activateScene(0);

  const storyTabs = [...document.querySelectorAll('.place-tab[data-place-story]')];
  const storyPanels = [...document.querySelectorAll('.place-panel[data-place-story-panel]')];
  let storyIndex = 0;
  const activateStory = (index, focus = false) => {
    storyIndex = Math.max(0, Math.min(index, storyTabs.length - 1));
    storyTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === storyIndex;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    storyPanels.forEach((panel, panelIndex) => {
      const active = panelIndex === storyIndex;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (focus) storyTabs[storyIndex]?.focus({ preventScroll: true });
  };
  storyTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateStory(index));
    tab.addEventListener('keydown', (event) => {
      const keys = {
        ArrowLeft: Math.max(0, storyIndex - 1),
        ArrowRight: Math.min(storyTabs.length - 1, storyIndex + 1),
        Home: 0,
        End: storyTabs.length - 1
      };
      if (!(event.key in keys)) return;
      event.preventDefault();
      activateStory(keys[event.key], true);
    });
  });
  if (storyTabs.length) activateStory(0);

  const companyReasons = [...document.querySelectorAll('.company-reason')];
  const activateReason = (selected) => {
    companyReasons.forEach((reason) => {
      const active = reason === selected;
      reason.classList.toggle('is-active', active);
      reason.setAttribute('aria-expanded', String(active));
    });
  };
  companyReasons.forEach((reason) => {
    reason.addEventListener('click', () => activateReason(reason));
    reason.addEventListener('mouseenter', () => activateReason(reason));
    reason.addEventListener('focus', () => activateReason(reason));
  });

  const videoDialog = document.querySelector('#video-dialog');
  const videoFrame = videoDialog?.querySelector('[data-video-frame]');
  const videoTitle = videoDialog?.querySelector('#video-dialog-title');
  const videoClose = videoDialog?.querySelector('.video-dialog-close');
  let videoReturnFocus = null;
  const closeVideo = () => {
    if (!videoDialog) return;
    if (videoDialog.open) videoDialog.close();
    if (videoFrame) videoFrame.replaceChildren();
    videoReturnFocus?.focus({ preventScroll: true });
  };
  const openVideo = (button) => {
    if (!videoDialog || !videoFrame) return;
    const { videoProvider, videoId, videoTitle: title } = button.dataset;
    if (!videoProvider || !videoId) return;
    const sources = {
      rutube: `https://rutube.ru/play/embed/${videoId}?autoplay=1`,
      kinescope: `https://kinescope.io/embed/${videoId}?autoplay=1`
    };
    if (!sources[videoProvider]) return;
    videoReturnFocus = button;
    if (forestAudio && !forestAudio.paused) forestAudio.pause();
    if (videoTitle) videoTitle.textContent = title || 'Видео о проекте';
    videoDialog.dataset.format = button.classList.contains('reel-card') ? 'vertical' : 'horizontal';
    const iframe = document.createElement('iframe');
    iframe.src = sources[videoProvider];
    iframe.title = title || 'Видео о проекте';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    videoFrame.replaceChildren(iframe);
    videoDialog.showModal();
  };
  document.querySelectorAll('[data-video-provider][data-video-id]').forEach((button) => {
    button.addEventListener('click', () => openVideo(button));
  });
  videoClose?.addEventListener('click', closeVideo);
  videoDialog?.addEventListener('click', (event) => {
    if (event.target === videoDialog) closeVideo();
  });
  videoDialog?.addEventListener('close', () => {
    if (videoFrame?.children.length) videoFrame.replaceChildren();
  });

  const soundButton = document.querySelector('.sound-control');
  const floatingBirdButton = document.querySelector('.floating-bird-control');
  const soundStatus = document.querySelector('.sound-status');
  const forestAudio = document.querySelector('#forest-audio');
  const setSoundState = (playing) => {
    [soundButton, floatingBirdButton].forEach((button) => {
      if (!button) return;
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Выключить звуки леса' : 'Включить звуки леса');
    });
    const strong = soundButton?.querySelector('strong');
    if (strong) strong.textContent = playing ? 'Лес звучит' : 'Послушать лес';
    const floatingLabel = floatingBirdButton?.querySelector('span');
    if (floatingLabel) floatingLabel.textContent = playing ? 'Выключить лес' : 'Звук леса';
    syncFloatingBird();
  };
  const toggleForestSound = async () => {
    if (!forestAudio) return;
    soundStatus?.classList.add('is-visible');
    if (!forestAudio.paused) {
      forestAudio.pause();
      setSoundState(false);
      return;
    }
    try {
      await forestAudio.play();
      setSoundState(true);
    } catch {
      setSoundState(false);
      if (soundStatus) soundStatus.textContent = 'Не удалось включить звук — проверьте настройки браузера';
    }
  };
  soundButton?.addEventListener('click', toggleForestSound);
  floatingBirdButton?.addEventListener('click', toggleForestSound);
  const syncFloatingBird = () => {
    const hero = document.querySelector('.hero');
    if (!floatingBirdButton || !hero) return;
    floatingBirdButton.classList.toggle('is-visible', !forestAudio?.paused && scrollY > hero.offsetHeight * .72);
  };
  addEventListener('scroll', syncFloatingBird, { passive: true });
  addEventListener('resize', syncFloatingBird, { passive: true });
  syncFloatingBird();
  forestAudio?.addEventListener('pause', () => setSoundState(false));
  forestAudio?.addEventListener('error', () => {
    setSoundState(false);
    if (soundStatus) soundStatus.textContent = 'Аудиофайл временно недоступен';
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && forestAudio && !forestAudio.paused) forestAudio.pause();
  });

  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
  };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    if (mobileMenu) mobileMenu.hidden = open;
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
})();
