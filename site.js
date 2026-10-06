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

const heroFlow = document.querySelector('.hero-flow');
let heroFlowTimers = [];
let heroFlowVisible = false;
function stopHeroFlow() {
  heroFlowTimers.forEach(clearTimeout);
  heroFlowTimers = [];
}
function playHeroFlow() {
  if (!heroFlow || prefersReducedMotion || !heroFlowVisible || document.hidden) return;
  stopHeroFlow();
  heroFlow.dataset.stage = 'question';
  [
    [850, 'typing'],
    [1650, 'reply'],
    [3100, 'followup'],
    [4400, 'booking'],
  ].forEach(([delay, stage]) => heroFlowTimers.push(setTimeout(() => {
    if (heroFlowVisible && !document.hidden) heroFlow.dataset.stage = stage;
  }, delay)));
  heroFlowTimers.push(setTimeout(playHeroFlow, 11400));
}
if (heroFlow) {
  if (prefersReducedMotion) {
    heroFlow.dataset.stage = 'booking';
  } else {
    const heroFlowObserver = new IntersectionObserver(entries => {
      heroFlowVisible = entries[0].isIntersecting;
      if (heroFlowVisible) playHeroFlow();
      else stopHeroFlow();
    }, { threshold: .08 });
    heroFlowObserver.observe(heroFlow);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopHeroFlow();
      else if (heroFlowVisible) playHeroFlow();
    });
  }
}

const productTour = document.querySelector('[data-product-tour]');
if (productTour) {
  const tourButtons = [...productTour.querySelectorAll('[data-tour-step]')];
  const tourPanels = [...productTour.querySelectorAll('[data-tour-panel]')];
  const tourCount = productTour.querySelector('.tour-screen-count');
  let currentStep = 0;
  let tourVisible = false;
  let tourPaused = false;
  let tourInteracted = false;
  let tourTimer;

  const stopTour = () => {
    clearTimeout(tourTimer);
    tourTimer = undefined;
  };
  const showTourStep = index => {
    currentStep = (index + tourButtons.length) % tourButtons.length;
    tourButtons.forEach((button, position) => {
      const active = position === currentStep;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    tourPanels.forEach((panel, position) => {
      const active = position === currentStep;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
    tourCount.textContent = `0${currentStep + 1} / 03`;
  };
  const scheduleTour = () => {
    stopTour();
    if (prefersReducedMotion || !tourVisible || tourPaused || tourInteracted || document.hidden) return;
    tourTimer = setTimeout(() => {
      showTourStep(currentStep + 1);
      scheduleTour();
    }, 5200);
  };

  tourButtons.forEach((button, index) => button.addEventListener('click', () => {
    tourInteracted = true;
    stopTour();
    showTourStep(index);
  }));
  productTour.addEventListener('pointerenter', () => { tourPaused = true; stopTour(); });
  productTour.addEventListener('pointerleave', () => { tourPaused = false; scheduleTour(); });
  productTour.addEventListener('focusin', () => { tourPaused = true; stopTour(); });
  productTour.addEventListener('focusout', event => {
    if (!productTour.contains(event.relatedTarget)) { tourPaused = false; scheduleTour(); }
  });
  document.addEventListener('visibilitychange', scheduleTour);
  if (!prefersReducedMotion) {
    const tourObserver = new IntersectionObserver(([entry]) => {
      tourVisible = entry.isIntersecting;
      scheduleTour();
    }, { threshold: .25 });
    tourObserver.observe(productTour);
  }
}

if (!prefersReducedMotion) {
  const revealTargets = [...document.querySelectorAll('.section-head, .performance-grid .perf-photo, .planning-copy, .flow-card, .product-stage, .sales-knowledge-heading, .sales-knowledge-benefits article, .story-tiles article, .step-card, .proof-photo, .proof-content, .assistant-stage, .faq-heading, .faq-list, .final-inner')];
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

  const storyStages = document.querySelectorAll('.performance-grid .card, .flow-art, .sales-knowledge-stage, .final-cta');
  const storyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (entry.target.matches('.flow-art')) {
        entry.target.closest('section')?.classList.add('demo-active');
      } else {
        entry.target.classList.add('demo-active');
      }
      storyObserver.unobserve(entry.target);
    });
  }, { threshold: .35 });
  storyStages.forEach(stage => storyObserver.observe(stage));
}

// Loop the phone conversation while it is in view so the handoff reads as a real exchange.
const assistantStage = document.querySelector('.assistant-stage');
if (assistantStage && !prefersReducedMotion) {
  let phoneVisible = false;
  let phoneTimers = [];
  const clearPhoneTimers = () => {
    phoneTimers.forEach(clearTimeout);
    phoneTimers = [];
  };
  const playPhoneChat = () => {
    if (!phoneVisible || document.hidden) return;
    clearPhoneTimers();
    assistantStage.dataset.chatPhase = 'question';
    [[1050, 'typing'], [2050, 'reply'], [3150, 'complete']].forEach(([delay, phase]) => {
      phoneTimers.push(setTimeout(() => {
        if (phoneVisible && !document.hidden) assistantStage.dataset.chatPhase = phase;
      }, delay));
    });
    phoneTimers.push(setTimeout(playPhoneChat, 7800));
  };
  const phoneObserver = new IntersectionObserver(([entry]) => {
    phoneVisible = entry.isIntersecting;
    if (phoneVisible) playPhoneChat();
    else {
      clearPhoneTimers();
      assistantStage.dataset.chatPhase = 'complete';
    }
  }, { threshold: .18 });
  phoneObserver.observe(assistantStage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearPhoneTimers();
    else if (phoneVisible) playPhoneChat();
  });
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
const demoDelays = [1100, 1700, 1200, 2200, 1200, 2200, 1100, 3600];
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
  demoTyping?.classList.toggle('is-typing', nextStep === 0 || nextStep === 2 || nextStep === 4 || nextStep === 6);
  if (demoMessages && nextStep > 0) {
    requestAnimationFrame(() => demoMessages.scrollTo({ top: demoMessages.scrollHeight, behavior: 'smooth' }));
  }
  if (demoStatus) {
    demoStatus.textContent = nextStep === demoBubbles.length - 1 ? 'Specialist follow-up requested' :
      nextStep % 2 === 0 ? 'Ray is reviewing the buyer’s context' : 'Ray is handling this conversation';
  }
  if (demoPauseButton) demoPauseButton.hidden = false;
}

function advanceDemo() {
  clearTimeout(demoTimer);
  if (demoPaused || !demoVisible || document.visibilityState !== 'visible') return;
  if (demoStep >= demoBubbles.length - 1) {
    restartDemo();
    return;
  }
  showDemoStep(demoStep + 1);
  scheduleDemo(demoStep < demoBubbles.length - 1 ? demoDelays[demoStep] : 4200);
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
  else if (demoVisible && document.visibilityState === 'visible') scheduleDemo(demoRemaining || (demoStep < demoBubbles.length - 1 ? demoDelays[demoStep] : 4200));
});
if (demoWindow && !prefersReducedMotion) {
  const observer = new IntersectionObserver(entries => {
    const inView = entries.some(entry => entry.intersectionRatio >= .28);
    if (!inView && demoVisible) holdDemo();
    demoVisible = inView;
    if (demoVisible && !demoPaused && document.visibilityState === 'visible') {
      if (demoStep < 0) advanceDemo();
      else scheduleDemo(demoRemaining || (demoStep < demoBubbles.length - 1 ? demoDelays[demoStep] : 4200));
    }
  }, { threshold: [.28] });
  observer.observe(demoWindow);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') holdDemo();
    else if (demoVisible && !demoPaused) scheduleDemo(demoRemaining || (demoStep < demoBubbles.length - 1 ? demoDelays[demoStep] : 4200));
  });
} else if (demoWindow) {
  showDemoStep(demoBubbles.length - 1);
  if (demoPauseButton) demoPauseButton.hidden = true;
}

const shopThread = document.querySelector('.shop-thread');
const shopExtra = document.querySelector('.shop-extra');
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
document.querySelector('[data-shop-action="buy"]')?.addEventListener('click', () => {
  appendShopMessage('ray', 'I have the quantity and deadline. A specialist can confirm the invoice, stock, and delivery quote before you commit.');
  scrollShopThread();
});
document.querySelector('[data-shop-action="details"]')?.addEventListener('click', () => {
  appendShopMessage('ray', 'Nova Mini · listed at $149 per unit. Volume pricing and Friday delivery need team confirmation.');
  scrollShopThread();
});

const calcInputs = ['calc-hours', 'calc-rate', 'calc-share'].map(id => document.getElementById(id));
const calcPlan = document.getElementById('calc-plan');
const calcResult = document.getElementById('calc-result');
const calcEquation = document.getElementById('calc-equation');
const calcResultLabel = document.getElementById('calc-result-label');
const calcNote = document.getElementById('calc-note');
function updateEconomics() {
  if (!calcResult || calcInputs.some(input => !input)) return;
  const [hours, rate, share] = calcInputs.map(input => Number(input.value));
  const valid = calcInputs.every(input => input.value !== '' && input.checkValidity()) && (!calcPlan?.value || calcPlan.checkValidity());
  if (!valid || !Number.isFinite(hours * rate * share)) {
    calcResult.innerHTML = '—<span>/mo</span>';
    if (calcEquation) calcEquation.textContent = 'Enter your numbers to see the calculation';
    return;
  }
  const laborValue = Math.round(hours * (52 / 12) * rate * Math.min(share, 100) / 100);
  const hasPlan = calcPlan?.value !== '';
  const estimate = hasPlan ? laborValue - Number(calcPlan.value) : laborValue;
  const currency = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const amount = document.createTextNode(currency(Math.abs(estimate)));
  const suffix = document.createElement('span');
  suffix.textContent = '/mo';
  calcResult.replaceChildren(amount, suffix);
  if (calcResultLabel) calcResultLabel.textContent = hasPlan
    ? estimate < 0 ? 'Plan cost above covered labor' : 'Potential monthly cost difference'
    : 'Monthly wage-equivalent hours';
  if (calcEquation) calcEquation.textContent = `${hours} h/week × 4.33 weeks × ${currency(rate)}/h × ${share}%${hasPlan ? ` − ${currency(Number(calcPlan.value))} plan` : ''}`;
  if (calcNote) calcNote.textContent = hasPlan
    ? 'This is an editable scenario, not measured savings. Cash savings require fewer paid hours or an avoided hire. The starting BLS wage excludes benefits; results are not guaranteed.'
    : 'An editable scenario, not measured savings. The starting BLS wage excludes benefits. Cash savings require fewer paid hours or an avoided hire; enter your full Reply2Lead quote to compare.';
}
[...calcInputs, calcPlan].forEach(input => input?.addEventListener('input', updateEconomics));
updateEconomics();

const inboxItems = [...document.querySelectorAll('.inbox-item')];
const inboxFilters = [...document.querySelectorAll('.inbox-tabs button')];
function selectConversation(item) {
  const rayActivity = {
    'Maya L.': '✳ Ray confirmed the scope and asked about the launch date.',
    'Elliot K.': '✳ Ray paused so your team can approve the contract exception.',
    'Amara P.': '✳ Ray captured the team size and preferred consultation time.',
    'Noah R.': '✳ Ray answered from the approved service guide.',
    'Iris C.': '✳ Ray is checking the client’s eligibility criteria.'
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
  button.setAttribute('aria-label', added ? 'Add lead to CRM' : 'Remove lead from CRM');
});

const examples = [
  {
    quote: '“Could we start with one site and add the second later?”',
    description: 'Ray recognizes a phased rollout question, checks the buyer’s deadline, and leaves the custom quote to your team.',
    question: 'Could we start with one site and add the second later?',
    answer: 'Our approved scope supports phases. Is your first opening date fixed?',
    detail: 'Yes, six weeks. Site two is waiting on permits.',
    followup: 'I’ll ask a specialist to quote site one now and confirm how site two can be scheduled after permits clear.',
    result: 'Scope and deadline sent to your team'
  },
  {
    quote: '“Our budget opens next quarter. Can you wait?”',
    description: 'Ray keeps the buying context and follows up when the budget opens, without restarting the sales conversation.',
    question: 'Our budget opens next quarter. Can you wait?',
    answer: 'Of course. What would you need to evaluate before then?',
    detail: 'A case study from a 10-person team and a pilot price.',
    followup: 'I’ll share an approved case study now and bring your pilot request to the team. I can follow up when your budget opens.',
    result: 'Pilot request saved · Follow-up planned'
  },
  {
    quote: '“Can you guarantee that exception in our contract?”',
    description: 'Ray never invents a special term. It gathers the reason, then sends the exception to a person who can approve it.',
    question: 'Can you guarantee that exception in our contract?',
    answer: 'I can explain the standard policy, but an exception needs approval. Which term is the blocker?',
    detail: 'We need a 30-day exit if the launch is delayed.',
    followup: 'I’ve captured the clause and launch risk. I’ll ask a specialist to confirm what can be offered.',
    result: 'Contract exception awaiting approval'
  }
];
let exampleIndex = 0;
const proofPanel = document.querySelector('.proof-chat-panel');
const proofThread = document.querySelector('.proof-chat-thread');
const proofSteps = [...document.querySelectorAll('[data-proof-step]')];
let proofTimers = [];
let proofVisible = false;

function clearProofTimers() {
  proofTimers.forEach(clearTimeout);
  proofTimers = [];
}

function showProofStep(stage) {
  proofSteps.forEach(element => {
    const step = Number(element.dataset.proofStep);
    element.classList.toggle('is-visible', element.classList.contains('proof-typing') ? step === stage : step <= stage);
  });
  if (stage > 0) requestAnimationFrame(() => proofThread?.scrollTo({ top: proofThread.scrollHeight, behavior: 'smooth' }));
}

function playProofConversation() {
  if (!proofPanel || prefersReducedMotion || !proofVisible || document.hidden) return;
  clearProofTimers();
  showProofStep(0);
  [[160, 1], [1300, 2], [2350, 3], [4750, 4], [6100, 5], [7250, 6], [10300, 7]].forEach(([delay, stage]) => {
    proofTimers.push(setTimeout(() => {
      if (proofVisible && !document.hidden) showProofStep(stage);
    }, delay));
  });
  proofTimers.push(setTimeout(playProofConversation, 18000));
}

function setExample(next) {
  exampleIndex = (next + examples.length) % examples.length;
  const example = examples[exampleIndex];
  document.getElementById('example-quote').textContent = example.quote;
  document.getElementById('example-description').textContent = example.description;
  document.getElementById('example-count').textContent = `0${exampleIndex + 1} / 0${examples.length}`;
  document.getElementById('proof-customer-question').textContent = example.question;
  document.getElementById('proof-ray-answer').textContent = example.answer;
  document.getElementById('proof-customer-detail').textContent = example.detail;
  document.getElementById('proof-ray-followup').textContent = example.followup;
  document.getElementById('proof-chat-result').textContent = example.result;
  if (proofVisible) playProofConversation();
  else if (!prefersReducedMotion) showProofStep(7);
}
document.getElementById('example-prev')?.addEventListener('click', () => setExample(exampleIndex - 1));
document.getElementById('example-next')?.addEventListener('click', () => setExample(exampleIndex + 1));
if (proofPanel && !prefersReducedMotion) {
  proofPanel.classList.add('proof-running');
  showProofStep(7);
  const proofObserver = new IntersectionObserver(entries => {
    proofVisible = entries[0].isIntersecting;
    if (proofVisible) playProofConversation();
    else clearProofTimers();
  }, { threshold: .35 });
  proofObserver.observe(proofPanel);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearProofTimers();
    else if (proofVisible) playProofConversation();
  });
}
