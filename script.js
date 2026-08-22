/* Casa di Mary — micro-interactions */

(() => {
  /* ---------- Experience switcher (booking form) ---------- */
  const form = document.getElementById('bookForm');
  const formTitle = document.getElementById('formTitle');
  const isENPage = document.documentElement.lang === 'en';
  const setExperience = (val) => {
    if (!form) return;
    const radio = form.querySelector(`input[name="experience"][value="${val}"]`);
    if (radio) radio.checked = true;
    if (formTitle) {
      if (isENPage) {
        formTitle.textContent = val === 'medusa'
          ? 'Reserve the Medusa Suite'
          : 'Request availability';
      } else {
        formTitle.textContent = val === 'medusa'
          ? 'Riserva la Medusa Suite'
          : 'Richiedi disponibilità';
      }
    }
  };
  document.querySelectorAll('[data-book]').forEach(btn => {
    btn.addEventListener('click', () => setExperience(btn.dataset.book));
  });
  form?.querySelectorAll('input[name="experience"]').forEach(r => {
    r.addEventListener('change', e => setExperience(e.target.value));
  });

  /* ---------- WhatsApp redirect on submit ---------- */
  const WA_PHONE = '393201762726'; // formato internazionale senza '+' e senza spazi
  const isEN = isENPage;
  const fmtDate = (s) => {
    if (!s) return '';
    const [y, m, d] = s.split('-');
    return isEN ? `${m}/${d}/${y}` : `${d}/${m}/${y}`;
  };
  const fieldVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };
  const T = isEN ? {
    intro:     'Hello, I would like to check availability at Casa di Mary.',
    apartment: 'Whole Apartment (up to 6 guests)',
    medusa:    'Medusa Suite (experience for two)',
    exp:       'Experience',
    name:      'Name',
    email:     'Email',
    phone:     'Phone',
    checkin:   'Check-in',
    checkout:  'Check-out',
    guests:    'Guests',
    msg:       'Message',
    thanks:    'Thank you!',
    sent:      'Opened in WhatsApp ✓'
  } : {
    intro:     'Buongiorno, vorrei richiedere disponibilità per Casa di Mary.',
    apartment: 'Intero Appartamento (fino a 6 ospiti)',
    medusa:    'Medusa Suite (esperienza per due)',
    exp:       'Esperienza',
    name:      'Nome',
    email:     'Email',
    phone:     'Telefono',
    checkin:   'Check-in',
    checkout:  'Check-out',
    guests:    'Ospiti',
    msg:       'Messaggio',
    thanks:    'Grazie!',
    sent:      'Aperto su WhatsApp ✓'
  };
  const buildWhatsAppMessage = () => {
    const expEl = form?.querySelector('input[name="experience"]:checked');
    const exp = expEl ? expEl.value : 'apartment';
    const expLabel = exp === 'medusa' ? T.medusa : T.apartment;

    const name   = fieldVal('f-name');
    const mail   = fieldVal('f-mail');
    const tel    = fieldVal('f-tel');
    const cin    = fmtDate(fieldVal('f-in'));
    const cout   = fmtDate(fieldVal('f-out'));
    const guests = fieldVal('f-guests');
    const note   = fieldVal('f-note');

    const L = [];
    L.push(T.intro);
    L.push('');
    L.push('• ' + T.exp + ': ' + expLabel);
    if (name)   L.push('• ' + T.name + ': ' + name);
    if (mail)   L.push('• ' + T.email + ': ' + mail);
    if (tel)    L.push('• ' + T.phone + ': ' + tel);
    if (cin)    L.push('• ' + T.checkin + ': ' + cin);
    if (cout)   L.push('• ' + T.checkout + ': ' + cout);
    if (guests) L.push('• ' + T.guests + ': ' + guests);
    if (note)   { L.push(''); L.push(T.msg + ': ' + note); }
    L.push('');
    L.push(T.thanks);
    return L.join('\n');
  };
  /* Localized validity messages */
  const V = isEN ? {
    nameRequired: 'Please enter your name.',
    mailRequired: 'Please enter your e-mail address.',
    mailInvalid:  'Please enter a valid e-mail address (e.g. name@example.com).'
  } : {
    nameRequired: 'Inserisci il tuo nome.',
    mailRequired: 'Inserisci il tuo indirizzo e-mail.',
    mailInvalid:  'Inserisci un indirizzo e-mail valido (es. nome@esempio.com).'
  };
  const nameEl = document.getElementById('f-name');
  const mailEl = document.getElementById('f-mail');
  const setValidityMessages = () => {
    if (nameEl) {
      nameEl.setCustomValidity('');
      if (!nameEl.value.trim()) nameEl.setCustomValidity(V.nameRequired);
    }
    if (mailEl) {
      mailEl.setCustomValidity('');
      const val = mailEl.value.trim();
      if (!val) mailEl.setCustomValidity(V.mailRequired);
      else if (!mailEl.checkValidity()) mailEl.setCustomValidity(V.mailInvalid);
    }
  };
  // clear custom message as the user types
  nameEl?.addEventListener('input', () => nameEl.setCustomValidity(''));
  mailEl?.addEventListener('input', () => mailEl.setCustomValidity(''));

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    setValidityMessages();
    if (!nameEl.value.trim() || !mailEl.value.trim() || !mailEl.checkValidity()) {
      nameEl.reportValidity();
      mailEl.reportValidity();
      return;
    }
    const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    window.open(url, '_blank', 'noopener');

    const btn = form.querySelector('.form__submit');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = T.sent;
      btn.disabled = true;
      btn.style.opacity = '.7';
      btn.style.cursor = 'default';
      setTimeout(() => {
        btn.textContent = orig;
        btn.disabled = false;
        btn.style.opacity = '';
        btn.style.cursor = '';
      }, 3000);
    }
  });

  /* ---------- Date constraints (check-in / check-out) ---------- */
  const cinEl  = document.getElementById('f-in');
  const coutEl = document.getElementById('f-out');
  if (cinEl && coutEl) {
    const today = new Date().toISOString().split('T')[0];
    cinEl.min = today;
    coutEl.min = today;
    cinEl.addEventListener('change', () => {
      if (!cinEl.value) return;
      // check-out almeno il giorno dopo
      const next = new Date(cinEl.value);
      next.setDate(next.getDate() + 1);
      const nextStr = next.toISOString().split('T')[0];
      coutEl.min = nextStr;
      if (coutEl.value && coutEl.value <= cinEl.value) coutEl.value = nextStr;
    });
  }

  /* ---------- Cookie banner + lazy Google Maps ---------- */
  const COOKIE_KEY = 'cdm_cookie_consent'; // 'all' | 'essential'
  const banner = document.getElementById('cookieBanner');
  const mapWrap = document.getElementById('mapWrap');

  const loadMap = () => {
    if (!mapWrap || mapWrap.dataset.loaded === '1') return;
    const src = mapWrap.dataset.mapSrc;
    if (!src) return;
    mapWrap.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.title = isEN ? 'Casa di Mary map' : 'Mappa Casa di Mary';
    mapWrap.appendChild(iframe);
    mapWrap.dataset.loaded = '1';
  };

  const setConsent = (val) => {
    try { localStorage.setItem(COOKIE_KEY, val); } catch(_) {}
    if (banner) banner.hidden = true;
    if (val === 'all') loadMap();
  };

  // mostra il banner se nessuna scelta è stata salvata
  let consent = null;
  try { consent = localStorage.getItem(COOKIE_KEY); } catch(_) {}
  if (banner) {
    if (!consent) {
      banner.hidden = false;
    } else if (consent === 'all') {
      loadMap();
    }
  }

  document.querySelectorAll('[data-cookie]').forEach(btn => {
    btn.addEventListener('click', () => setConsent(btn.dataset.cookie));
  });

  // bottone manuale "Carica la mappa" all'interno del placeholder
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'loadMap') {
      setConsent('all');
    }
  });

  /* ---------- Nav scroll state ---------- */
  const nav = document.getElementById('nav');
  const setScrolled = () => {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* ---------- Floating "Prenota" FAB ---------- */
  const fab = document.getElementById('fab');
  if (fab) {
    const setFab = () => {
      // show after scrolling past the hero, hide on the contact section
      const hero = document.querySelector('.hero');
      const book = document.getElementById('contatti');
      const past = window.scrollY > (hero ? hero.offsetHeight * 0.6 : 400);
      const onBook = book && (book.getBoundingClientRect().top < window.innerHeight * 0.6);
      if (past && !onBook) fab.classList.add('is-visible');
      else fab.classList.remove('is-visible');
    };
    setFab();
    window.addEventListener('scroll', setFab, { passive: true });
    window.addEventListener('resize', setFab);
  }

  /* ---------- Mobile menu ---------- */
  const burger = nav.querySelector('.nav__burger');
  const overlay = nav.querySelector('.nav__overlay');
  const panel = nav.querySelector('.nav__panel');
  const closeMenu = () => nav.classList.remove('is-open');
  burger.addEventListener('click', () => nav.classList.toggle('is-open'));
  overlay.addEventListener('click', closeMenu);
  panel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Sliders ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const slides = [...slider.querySelectorAll('.slider__slide')];
    const dots   = [...slider.querySelectorAll('.slider__dots button')];
    const prev   = slider.querySelector('[data-prev]');
    const next   = slider.querySelector('[data-next]');
    let i = 0;
    let timer;

    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    };
    const startAuto = () => {
      stopAuto();
      if (prefersReducedMotion) return;
      timer = setInterval(() => show(i + 1), 5500);
    };
    const stopAuto = () => clearInterval(timer);

    prev?.addEventListener('click', () => { show(i - 1); startAuto(); });
    next?.addEventListener('click', () => { show(i + 1); startAuto(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { show(k); startAuto(); }));

    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    // touch swipe
    let touchX = null;
    slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1));
      touchX = null; startAuto();
    });

    startAuto();
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Smooth anchor offset (fixed nav) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const tgt = document.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      const y = tgt.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
