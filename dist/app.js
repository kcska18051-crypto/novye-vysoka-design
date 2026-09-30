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
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach((item) => revealObserver.observe(item));
  }

  reduceMotion.addEventListener?.('change', (event) => {
    if (event.matches) showAllReveals();
  });

  const siteHeader = document.querySelector('.site-header');
  const headerLinks = [...document.querySelectorAll('.site-header nav a[href^="#"]')];
  const syncHeaderState = () => siteHeader?.classList.toggle('is-scrolled', scrollY > 36);
  addEventListener('scroll', syncHeaderState, { passive: true });
  syncHeaderState();
  if ('IntersectionObserver' in window && headerLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      headerLinks.forEach((link) => {
        if (link.getAttribute('href') === `#${visible.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, .2, .6] });
    headerLinks.forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) sectionObserver.observe(section);
    });
  }

  const journeyTrack = document.querySelector('[data-journey-track]');
  const journeyTabs = [...document.querySelectorAll('.journey-tab[data-scene]')];
  const journeyPanels = [...document.querySelectorAll('.journey-panel[data-scene]')];
  const journeyCurrent = document.querySelector('[data-journey-current]');
  const journeyProgress = document.querySelector('[data-journey-progress]');
  const journeyPrev = document.querySelector('[data-journey-prev]');
  const journeyNext = document.querySelector('[data-journey-next]');
  let journeyIndex = 0;
  let journeyFrame = 0;

  const preloadJourneyNeighbors = (index) => {
    [index - 1, index + 1].forEach((neighborIndex) => {
      const source = journeyPanels[neighborIndex]?.querySelector('img')?.currentSrc || journeyPanels[neighborIndex]?.querySelector('img')?.src;
      if (!source) return;
      const preload = new Image();
      preload.src = source;
    });
  };

  const activateScene = (index, { scrollMobile = false, focusTab = false } = {}) => {
    if (!journeyPanels.length) return;
    const previousIndex = journeyIndex;
    journeyIndex = Math.max(0, Math.min(index, journeyPanels.length - 1));
    if (journeyTrack && journeyIndex !== previousIndex) journeyTrack.dataset.direction = journeyIndex > previousIndex ? 'next' : 'previous';
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
    if (journeyProgress) {
      journeyProgress.style.width = `${100 / journeyPanels.length}%`;
      journeyProgress.style.transform = `translateX(${journeyIndex * 100}%)`;
    }
    if (journeyPrev) journeyPrev.disabled = journeyIndex === 0;
    if (journeyNext) journeyNext.disabled = journeyIndex === journeyPanels.length - 1;
    preloadJourneyNeighbors(journeyIndex);
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
  journeyPrev?.addEventListener('click', () => activateScene(journeyIndex - 1, { scrollMobile: true }));
  journeyNext?.addEventListener('click', () => activateScene(journeyIndex + 1, { scrollMobile: true }));

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

  const enableDragScroll = (track) => {
    let pointerId = null;
    let startX = 0;
    let startScroll = 0;
    let suppressClick = false;
    track?.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      suppressClick = false;
      track.setPointerCapture(pointerId);
      track.classList.add('is-dragging');
    });
    track?.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 6) suppressClick = true;
      track.scrollLeft = startScroll - distance;
    });
    const stopDrag = (event) => {
      if (event.pointerId !== pointerId) return;
      track.releasePointerCapture?.(pointerId);
      pointerId = null;
      track.classList.remove('is-dragging');
    };
    track?.addEventListener('pointerup', stopDrag);
    track?.addEventListener('pointercancel', stopDrag);
    track?.addEventListener('click', (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);
  };
  enableDragScroll(document.querySelector('.reels-track'));

  const companyReasons = [...document.querySelectorAll('.company-reason')];
  const activateReason = (selected) => {
    const shouldOpen = selected.getAttribute('aria-expanded') !== 'true';
    companyReasons.forEach((reason) => {
      const active = reason === selected && shouldOpen;
      reason.classList.toggle('is-active', active);
      reason.setAttribute('aria-expanded', String(active));
      const toggle = reason.querySelector('.company-reason-toggle');
      if (toggle) toggle.textContent = active ? '−' : '+';
    });
  };
  companyReasons.forEach((reason) => {
    reason.addEventListener('click', () => activateReason(reason));
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

  const leadDialog = document.querySelector('#lead-dialog');
  const leadForm = leadDialog?.querySelector('[data-lead-form]');
  const leadTitle = leadDialog?.querySelector('#lead-dialog-title');
  const leadSubmit = leadDialog?.querySelector('.lead-dialog-submit');
  const leadClose = leadDialog?.querySelector('.lead-dialog-close');
  let leadReturnFocus = null;
  const leadContent = {
    selection: { title: 'Подобрать участок', submit: 'Получить подборку' },
    tour: { title: 'Записаться на экскурсию', submit: 'Записаться на экскурсию' },
    promotion: { title: 'Посмотреть участки по акции', submit: 'Получить подборку по акции' }
  };
  const setLeadIntent = (intent) => {
    const selectedIntent = leadContent[intent] ? intent : 'selection';
    const radio = leadForm?.querySelector(`input[name="popup-intent"][value="${selectedIntent}"]`);
    if (radio) radio.checked = true;
    if (leadTitle) leadTitle.textContent = leadContent[selectedIntent].title;
    if (leadSubmit) leadSubmit.textContent = leadContent[selectedIntent].submit;
  };
  const closeLead = () => {
    if (leadDialog?.open) leadDialog.close();
  };
  const openLead = (trigger) => {
    if (!leadDialog) return;
    leadReturnFocus = trigger;
    setLeadIntent(trigger.dataset.leadIntent);
    const status = leadDialog.querySelector('.form-status');
    if (status) status.textContent = '';
    leadForm?.classList.remove('is-error', 'is-loading', 'is-success');
    leadDialog.showModal();
  };
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-lead-intent]');
    if (!trigger) return;
    event.preventDefault();
    openLead(trigger);
  });
  leadForm?.querySelectorAll('input[name="popup-intent"]').forEach((radio) => {
    radio.addEventListener('change', () => setLeadIntent(radio.value));
  });
  leadClose?.addEventListener('click', closeLead);
  leadDialog?.addEventListener('click', (event) => {
    if (event.target === leadDialog) closeLead();
  });
  leadDialog?.addEventListener('close', () => {
    leadReturnFocus?.focus({ preventScroll: true });
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

  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
    if (!digits.startsWith('7')) digits = `7${digits}`;
    digits = digits.slice(0, 11);
    const local = digits.slice(1);
    let result = '+7';
    if (local.length) result += ` (${local.slice(0, 3)}`;
    if (local.length >= 3) result += ')';
    if (local.length > 3) result += ` ${local.slice(3, 6)}`;
    if (local.length > 6) result += `-${local.slice(6, 8)}`;
    if (local.length > 8) result += `-${local.slice(8, 10)}`;
    return result;
  };
  document.querySelectorAll('[data-demo-form]').forEach((demoForm) => {
    const phone = demoForm.querySelector('input[type="tel"]');
    const submit = demoForm.querySelector('button[type="submit"]');
    const status = demoForm.querySelector('.form-status');
    const error = phone?.parentElement.querySelector('.field-error');
    phone?.addEventListener('input', () => {
      phone.value = formatPhone(phone.value);
      phone.setCustomValidity('');
      phone.removeAttribute('aria-invalid');
      if (error) error.textContent = '';
      demoForm.classList.remove('is-error');
    });
    demoForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const phoneDigits = phone?.value.replace(/\D/g, '') || '';
      if (phone && phoneDigits.length !== 11) {
        phone.setCustomValidity('Введите телефон полностью');
        phone.setAttribute('aria-invalid', 'true');
        if (error) error.textContent = 'Введите телефон полностью';
      }
      const invalid = demoForm.querySelector(':invalid');
      if (invalid) {
        demoForm.classList.add('is-error');
        demoForm.classList.remove('is-success', 'is-loading');
        if (status) status.textContent = 'Проверьте отмеченные поля';
        invalid.focus({ preventScroll: true });
        invalid.reportValidity?.();
        return;
      }
      demoForm.classList.remove('is-error', 'is-success');
      demoForm.classList.add('is-loading');
      if (submit) {
        submit.disabled = true;
        submit.setAttribute('aria-busy', 'true');
      }
      if (status) status.textContent = 'Проверяем данные…';
      setTimeout(() => {
        demoForm.classList.remove('is-loading');
        demoForm.classList.add('is-success');
        if (submit) {
          submit.disabled = false;
          submit.removeAttribute('aria-busy');
        }
        if (status) status.textContent = 'Форма заполнена. Отправка будет подключена перед запуском сайта.';
      }, reduceMotion.matches ? 0 : 450);
    });
  });

  const tourForm = document.querySelector('#tour [data-demo-form]');
  const tourSubmit = tourForm?.querySelector('[data-tour-submit]');
  const syncTourSubmit = () => {
    const intent = tourForm?.querySelector('input[name="intent"]:checked')?.value;
    if (tourSubmit) tourSubmit.textContent = intent === 'video' ? 'Получить видео участка' : 'Записаться на экскурсию';
  };
  tourForm?.querySelectorAll('input[name="intent"]').forEach((option) => option.addEventListener('change', syncTourSubmit));
  syncTourSubmit();

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
