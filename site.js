const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.add('js-ready');

const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = !open;
});
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
}));

const heroVideo = document.querySelector('.hero-video');
if (prefersReducedMotion && heroVideo) heroVideo.pause();
if (heroVideo && !prefersReducedMotion) {
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? heroVideo.play().catch(() => {}) : heroVideo.pause());
  }, { threshold: .08 });
  heroObserver.observe(heroVideo);
}

if (!prefersReducedMotion) {
  const revealTargets = [...document.querySelectorAll('.section-head, .performance-grid .card, .planning-copy, .flow-card, .product-stage, .sales-knowledge-heading, .sales-knowledge-benefits article, .story-tiles article, .step-card, .proof-photo, .proof-content, .assistant-stage, .faq-heading, .faq-list, .final-inner')];
  revealTargets.forEach((target, index) => {
    target.classList.add('reveal-target');
    target.style.setProperty('--reveal-delay', `${(index % 4) * 55}ms`);
  });
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  revealTargets.forEach(target => revealObserver.observe(target));

  const storyStages = document.querySelectorAll('.performance-grid .card, .flow-art, .sales-knowledge-stage, .steps-grid .step-card, .assistant-stage');
  const storyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.matches('.flow-art, .assistant-stage')) {
        entry.target.closest('section')?.classList.add('demo-active');
      } else {
        entry.target.classList.add('demo-active');
      }
      storyObserver.unobserve(entry.target);
    });
  }, { threshold: .35 });
  storyStages.forEach(stage => storyObserver.observe(stage));
}

const creditDemo = document.querySelector('.credit-demo');
const creditModeButtons = [...document.querySelectorAll('[data-credit-mode]')];
const creditCount = document.getElementById('credit-count');
const creditBadge = document.getElementById('credit-badge-text');
const creditState = document.getElementById('credit-state');
let creditTimers = [];
let creditVisible = false;
let creditInteracted = false;

function clearCreditTimers() {
  creditTimers.forEach(clearTimeout);
  creditTimers = [];
}

function setCreditMode(mode, count) {
  const exhausted = mode === 'exhausted';
  creditDemo.dataset.mode = mode;
  creditModeButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.creditMode === mode)));
  creditCount.textContent = count || (exhausted ? '0 AI credits left' : 'AI credits available');
  creditBadge.textContent = exhausted ? 'Knowledge mode' : 'AI-assisted mode';
  creditState.textContent = exhausted ? 'Reply sent · no AI credits used' : 'Reply sent · AI-assisted';
}

function queueCreditStep(delay, callback) {
  creditTimers.push(setTimeout(() => {
    if (creditVisible && document.visibilityState === 'visible') callback();
  }, delay));
}

function playCreditDemo(mode = 'exhausted', loop = false) {
  if (!creditDemo || prefersReducedMotion || !creditVisible) return;
  clearCreditTimers();
  creditDemo.classList.remove('is-playing');
  creditDemo.dataset.phase = 'start';
  setCreditMode(mode === 'exhausted' ? 'available' : mode, mode === 'exhausted' ? '2 AI credits left' : undefined);
  void creditDemo.offsetWidth;
  creditDemo.classList.add('is-playing');

  if (mode === 'exhausted') {
    queueCreditStep(1050, () => { creditDemo.dataset.phase = 'draining'; creditCount.textContent = '1 AI credit left'; });
    queueCreditStep(2250, () => { setCreditMode('exhausted'); creditDemo.dataset.phase = 'zero'; });
  }
  const messageStart = mode === 'exhausted' ? 2850 : 450;
  queueCreditStep(messageStart, () => { creditDemo.dataset.phase = 'incoming'; creditState.textContent = 'Question received'; });
  queueCreditStep(messageStart + 800, () => { creditDemo.dataset.phase = 'typing'; creditState.textContent = 'Ray is checking the answer'; });
  queueCreditStep(messageStart + 1950, () => { creditDemo.dataset.phase = 'reply'; creditState.textContent = 'Ray replied'; });
  queueCreditStep(messageStart + 2550, () => { creditDemo.dataset.phase = 'verified'; });
  queueCreditStep(messageStart + 3100, () => {
    creditDemo.dataset.phase = 'sent';
    creditState.textContent = mode === 'exhausted' ? 'Reply sent · no AI credits used' : 'Reply sent · AI-assisted';
  });
  if (loop) queueCreditStep(messageStart + 6400, () => playCreditDemo('exhausted', true));
}

if (creditDemo) {
  creditModeButtons.forEach(button => button.addEventListener('click', () => {
    creditInteracted = true;
    const mode = button.dataset.creditMode;
    if (prefersReducedMotion || !creditVisible) {
      clearCreditTimers();
      creditDemo.classList.remove('is-playing');
      setCreditMode(mode);
    } else {
      playCreditDemo(mode);
    }
  }));

  if (!prefersReducedMotion) {
    const creditObserver = new IntersectionObserver(entries => {
      creditVisible = entries[0].isIntersecting;
      if (creditVisible) {
        if (!creditInteracted) playCreditDemo('exhausted', true);
      } else {
        clearCreditTimers();
        creditDemo.classList.remove('is-playing');
        creditDemo.dataset.phase = 'sent';
        setCreditMode('exhausted');
        creditInteracted = false;
      }
    }, { threshold: .25 });
    creditObserver.observe(creditDemo);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        clearCreditTimers();
      } else if (creditVisible && !creditInteracted) {
        playCreditDemo('exhausted', true);
      }
    });
  }
}

const demoWindow = document.querySelector('.demo-window');
const demoMessages = document.getElementById('demo-messages');
const demoBubbles = [...document.querySelectorAll('.demo-window .demo-bubble')];
const demoTyping = document.querySelector('.demo-window .demo-typing');
const demoStatus = document.getElementById('demo-status');
const demoPauseButton = document.querySelector('.demo-pause');
const demoDelays = [8500, 5000, 11500, 4500, 11500, 4500];
let demoTimer;
let demoStep = -1;
let demoVisible = false;
let demoPaused = false;
let demoDueAt = 0;
let demoRemaining = 0;

function scheduleDemo(delay) {
  clearTimeout(demoTimer);
  demoRemaining = delay;
  demoDueAt = performance.now() + delay;
  demoTimer = setTimeout(advanceDemo, delay);
}

function holdDemo() {
  if (demoDueAt) demoRemaining = Math.max(0, demoDueAt - performance.now());
  clearTimeout(demoTimer);
  demoDueAt = 0;
}

function showDemoStep(nextStep) {
  demoStep = nextStep;
  demoBubbles.forEach((bubble, index) => bubble.classList.toggle('is-shown', index <= nextStep));
  demoTyping?.classList.toggle('is-typing', nextStep === 1 || nextStep === 3 || nextStep === 5);
  if (demoMessages && nextStep > 0) {
    requestAnimationFrame(() => demoMessages.scrollTo({ top: demoMessages.scrollHeight, behavior: 'smooth' }));
  }
  if (demoStatus) {
    demoStatus.textContent = nextStep === 6 ? 'Checkout link sent · example conversation' :
      nextStep % 2 === 1 ? 'Ray is typing a reply' : 'Ray is handling this conversation';
  }
  if (demoPauseButton) demoPauseButton.hidden = nextStep === demoBubbles.length - 1;
}

function advanceDemo() {
  clearTimeout(demoTimer);
  if (demoPaused || !demoVisible || document.visibilityState !== 'visible') return;
  if (demoStep >= demoBubbles.length - 1) return;
  showDemoStep(demoStep + 1);
  if (demoStep < demoBubbles.length - 1) scheduleDemo(demoDelays[demoStep]);
}

function restartDemo() {
  clearTimeout(demoTimer);
  demoPaused = false;
  demoPauseButton?.setAttribute('aria-label', 'Pause conversation');
  if (demoPauseButton) demoPauseButton.textContent = 'Pause';
  demoStep = -1;
  demoRemaining = 0;
  demoDueAt = 0;
  if (demoMessages) demoMessages.scrollTop = 0;
  if (prefersReducedMotion) {
    showDemoStep(demoBubbles.length - 1);
    return;
  }
  demoVisible = true;
  advanceDemo();
}

document.querySelector('.demo-replay')?.addEventListener('click', restartDemo);
demoPauseButton?.addEventListener('click', () => {
  demoPaused = !demoPaused;
  demoPauseButton.textContent = demoPaused ? 'Play' : 'Pause';
  demoPauseButton.setAttribute('aria-label', demoPaused ? 'Resume conversation' : 'Pause conversation');
  if (demoPaused) holdDemo();
  else if (demoVisible && document.visibilityState === 'visible') scheduleDemo(demoRemaining || demoDelays[demoStep]);
});
if (demoWindow && !prefersReducedMotion) {
  const observer = new IntersectionObserver(entries => {
    const inView = entries.some(entry => entry.intersectionRatio >= .28);
    if (!inView && demoVisible) holdDemo();
    demoVisible = inView;
    if (demoVisible && !demoPaused && document.visibilityState === 'visible') {
      if (demoStep < 0) advanceDemo();
      else if (demoStep < demoBubbles.length - 1) scheduleDemo(demoRemaining || demoDelays[demoStep]);
    }
  }, { threshold: [.28] });
  observer.observe(demoWindow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') holdDemo();
    else if (demoVisible && !demoPaused && demoStep < demoBubbles.length - 1) scheduleDemo(demoRemaining || demoDelays[demoStep]);
  });
} else if (demoWindow) {
  showDemoStep(demoBubbles.length - 1);
  if (demoPauseButton) demoPauseButton.hidden = true;
}

const shopThread = document.querySelector('.shop-thread');
const shopExtra = document.querySelector('.shop-extra');
const shopReplies = {
  discount: 'I do not have a verified student discount in this demo. I can ask the team for you.',
  returns: 'I do not have a verified return policy in this demo yet. I can pass your question to the team.',
  shipping: 'I do not have verified international shipping details in this demo. I can ask the team before promising a delivery date.'
};
function appendShopMessage(kind, message) {
  const bubble = document.createElement('div');
  bubble.className = `shop-extra-message ${kind}`;
  const label = document.createElement('small');
  label.textContent = kind === 'ray' ? '✳ Ray AI' : 'Customer';
  bubble.append(label, document.createTextNode(message));
  shopExtra.append(bubble);
}
function scrollShopThread() {
  requestAnimationFrame(() => shopThread?.scrollTo({ top: shopThread.scrollHeight, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
}
document.querySelectorAll('[data-shop-prompt]').forEach(button => button.addEventListener('click', () => {
  appendShopMessage('customer', button.textContent.trim());
  appendShopMessage('ray', shopReplies[button.dataset.shopPrompt]);
  scrollShopThread();
}));
document.querySelector('[data-shop-action="buy"]')?.addEventListener('click', () => {
  appendShopMessage('ray', 'A sample checkout link is ready. A live store would use your own verified checkout settings.');
  scrollShopThread();
});
document.querySelector('[data-shop-action="details"]')?.addEventListener('click', () => {
  appendShopMessage('ray', 'Demo product details: Nova Mini · $149 · 2-year warranty · free shipping.');
  scrollShopThread();
});
const shopSuggestions = document.getElementById('shop-suggestions');
document.querySelector('.shop-suggest-toggle')?.addEventListener('click', event => {
  shopSuggestions.hidden = !shopSuggestions.hidden;
  event.currentTarget.setAttribute('aria-expanded', String(!shopSuggestions.hidden));
});
document.querySelector('.shop-compose')?.addEventListener('submit', event => {
  event.preventDefault();
  const input = event.currentTarget.elements.question;
  const question = input.value.trim();
  if (!question) return;
  appendShopMessage('customer', question);
  appendShopMessage('ray', 'I do not have a verified answer to that yet. I can hand your question to the team.');
  input.value = '';
  scrollShopThread();
});

const inboxItems = [...document.querySelectorAll('.inbox-item')];
const inboxFilters = [...document.querySelectorAll('.inbox-tabs button')];
function selectConversation(item) {
  const rayActivity = {
    'Maya L.': '✳ Ray shared the product and delivery details.',
    'Elliot K.': '✳ Ray paused so your team can clarify the warranty.',
    'Amara P.': '✳ Ray gathered the preferred booking time.',
    'Noah R.': '✳ Ray answered the opening-hours question.',
    'Iris C.': '✳ Ray is checking online availability.'
  };
  inboxItems.forEach(row => row.classList.toggle('is-selected', row === item));
  document.getElementById('detail-name').textContent = item.dataset.person;
  document.getElementById('detail-avatar').textContent = item.dataset.person.charAt(0);
  document.getElementById('detail-source').textContent = `${item.dataset.source} conversation`;
  document.getElementById('detail-insight').textContent = item.dataset.insight;
  document.getElementById('detail-question').textContent = item.dataset.question;
  document.querySelector('.detail-ray').textContent = rayActivity[item.dataset.person] || '✳ Ray is handling the conversation.';
  document.querySelector('.detail-action strong').textContent = item.dataset.kind === 'needs' ? `Your team should reply ↗` : item.dataset.kind === 'qualified' ? `Follow up with ${item.dataset.person.split(' ')[0]} ↗` : 'Ray is handling this ↗';
  if (!prefersReducedMotion) {
    const detail = document.querySelector('.inbox-detail');
    detail?.classList.remove('is-changing');
    void detail?.offsetWidth;
    detail?.classList.add('is-changing');
  }
}
let productAutoDone = false;
let productAutoTimers = [];
function stopProductAuto() {
  productAutoTimers.forEach(clearTimeout);
  productAutoTimers = [];
  productAutoDone = true;
}
inboxItems.forEach(item => item.addEventListener('click', () => {
  stopProductAuto();
  selectConversation(item);
}));
inboxFilters.forEach(filter => filter.addEventListener('click', () => {
  stopProductAuto();
  inboxFilters.forEach(button => { const active = button === filter; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  const kind = filter.dataset.filter;
  inboxItems.forEach(item => { item.hidden = kind !== 'all' && item.dataset.kind !== kind; });
  const firstVisible = inboxItems.find(item => !item.hidden);
  if (firstVisible) selectConversation(firstVisible);
}));
if (!prefersReducedMotion && inboxItems.length >= 3) {
  const productStage = document.querySelector('.product-stage');
  const productObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting) || productAutoDone) return;
    productAutoTimers = [
      setTimeout(() => selectConversation(inboxItems[1]), 1300),
      setTimeout(() => selectConversation(inboxItems[2]), 3900),
      setTimeout(() => { selectConversation(inboxItems[0]); productAutoDone = true; }, 6500)
    ];
    productObserver.unobserve(productStage);
  }, { threshold: .35 });
  productObserver.observe(productStage);
}

document.querySelector('.story-crm-button')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const added = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!added));
  button.textContent = added ? '↗ Add to CRM' : '✓ Added to CRM';
  button.setAttribute('aria-label', added ? 'Add this example lead to CRM' : 'Remove this example lead from CRM');
});

const examples = [
  {
    quote: '“Can someone explain which service is right for me?”',
    description: 'Ray can collect what the customer needs, then bring in your team for a personal recommendation.',
    question: 'Can someone explain which service is right for me?',
    answer: "I can help with that. Here's a quick summary based on your needs...",
    points: ['Your goals and use case', 'Recommended option', 'Next steps']
  },
  {
    quote: '“I’m interested, but can we talk next month?”',
    description: 'Ray keeps the context and follows up when the customer asked — even after your team moves on to other chats.',
    question: 'I’m interested, but can we talk next month?',
    answer: 'Of course. I’ll remember what matters and check in when you’re ready.',
    points: ['Interest recorded', 'Timing saved', 'Follow-up scheduled']
  },
  {
    quote: '“Could I speak with someone about a custom order?”',
    description: 'Ray recognizes when a person is needed and passes the request to your team with the conversation attached.',
    question: 'Could I speak with someone about a custom order?',
    answer: 'Absolutely. I’ll bring in the right teammate and pass along what we’ve discussed.',
    points: ['Request identified', 'Context summarized', 'Team notified']
  }
];
let exampleIndex = 0;
function setExample(next) {
  exampleIndex = (next + examples.length) % examples.length;
  const example = examples[exampleIndex];
  document.getElementById('example-quote').textContent = example.quote;
  document.getElementById('example-description').textContent = example.description;
  document.getElementById('example-count').textContent = `0${exampleIndex + 1} / 0${examples.length}`;
  document.getElementById('proof-customer-question').textContent = example.question;
  document.getElementById('proof-ray-answer').textContent = example.answer;
  document.querySelectorAll('#proof-ray-points li').forEach((item, index) => { item.textContent = example.points[index]; });
  const panel = document.querySelector('.proof-chat-panel');
  panel.classList.remove('is-changing');
  void panel.offsetWidth;
  panel.classList.add('is-changing');
}
document.getElementById('example-prev')?.addEventListener('click', () => setExample(exampleIndex - 1));
document.getElementById('example-next')?.addEventListener('click', () => setExample(exampleIndex + 1));
