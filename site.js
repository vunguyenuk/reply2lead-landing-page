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
  const showTourStep = index => {
    const activeIndex = (index + tourButtons.length) % tourButtons.length;
    tourButtons.forEach((button, position) => {
      const active = position === activeIndex;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    tourPanels.forEach((panel, position) => {
      const active = position === activeIndex;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
      panel.tabIndex = active ? 0 : -1;
      if (active) panel.scrollLeft = 0;
    });
    tourCount.textContent = `0${activeIndex + 1} / 03`;
  };
  tourButtons.forEach((button, index) => {
    button.addEventListener('click', () => showTourStep(index));
    button.addEventListener('keydown', event => {
      const nextIndex = {
        ArrowDown: index + 1,
        ArrowRight: index + 1,
        ArrowUp: index - 1,
        ArrowLeft: index - 1,
        Home: 0,
        End: tourButtons.length - 1,
      }[event.key];
      if (nextIndex === undefined) return;
      event.preventDefault();
      const targetIndex = (nextIndex + tourButtons.length) % tourButtons.length;
      showTourStep(targetIndex);
      tourButtons[targetIndex].focus();
    });
  });
}

if (!prefersReducedMotion) {
  const revealTargets = [...document.querySelectorAll('.section-head, .performance-grid .perf-photo, .planning-copy, .flow-card, .product-stage, .sales-knowledge-heading, .sales-knowledge-benefits article, .step-card, .assistant-stage, .faq-heading, .faq-list, .final-inner')];
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

  const storyStages = document.querySelectorAll('.performance-grid .card, .flow-art, .sales-knowledge-stage');
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

// Pair each buyer question with the action Ray takes, then replay while the CTA is visible.
const finalCta = document.querySelector('.final-cta');
if (finalCta && !prefersReducedMotion) {
  const signals = [...finalCta.querySelectorAll('.cta-signal')];
  let ctaVisible = false;
  let ctaTimers = [];
  const clearCtaTimers = () => {
    ctaTimers.forEach(clearTimeout);
    ctaTimers = [];
  };
  const showAllCtaSignals = () => signals.forEach(signal => signal.classList.add('is-shown'));
  const playCtaSignals = () => {
    if (!ctaVisible || document.hidden) return;
    clearCtaTimers();
    signals.forEach(signal => signal.classList.remove('is-shown'));
    [450, 1150, 2450, 3150, 4450, 5150].forEach((delay, index) => {
      ctaTimers.push(setTimeout(() => {
        if (ctaVisible && !document.hidden) signals[index]?.classList.add('is-shown');
      }, delay));
    });
    ctaTimers.push(setTimeout(playCtaSignals, 10300));
  };
  finalCta.classList.add('cta-ready');
  const ctaObserver = new IntersectionObserver(([entry]) => {
    ctaVisible = entry.isIntersecting;
    if (ctaVisible) playCtaSignals();
    else {
      clearCtaTimers();
      showAllCtaSignals();
    }
  }, { threshold: .3 });
  ctaObserver.observe(finalCta);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearCtaTimers();
      showAllCtaSignals();
    } else if (ctaVisible) playCtaSignals();
  });
}

// Finish the Instagram DM after a short typing beat instead of leaving it loading.
const flowArt = document.querySelector('.flow-art');
if (flowArt) {
  if (prefersReducedMotion) {
    flowArt.dataset.chatPhase = 'complete';
  } else {
    let flowVisible = false;
    let flowTimers = [];
    const clearFlowTimers = () => {
      flowTimers.forEach(clearTimeout);
      flowTimers = [];
    };
    const playFlowChat = () => {
      if (!flowVisible || document.hidden) return;
      clearFlowTimers();
      flowArt.dataset.chatPhase = 'intro';
      flowTimers.push(setTimeout(() => {
        if (flowVisible && !document.hidden) flowArt.dataset.chatPhase = 'typing';
      }, 3200));
      flowTimers.push(setTimeout(() => {
        if (!flowVisible || document.hidden) return;
        flowArt.dataset.chatPhase = 'complete';
        const thread = flowArt.querySelector('.flow-chat-thread');
        thread?.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
      }, 4500));
    };
    const flowObserver = new IntersectionObserver(([entry]) => {
      flowVisible = entry.isIntersecting;
      if (flowVisible) playFlowChat();
      else {
        clearFlowTimers();
        flowArt.dataset.chatPhase = 'complete';
      }
    }, { threshold: .35 });
    flowObserver.observe(flowArt);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearFlowTimers();
        flowArt.dataset.chatPhase = 'complete';
      } else if (flowVisible) playFlowChat();
    });
  }
}

// Continue the buyer exchange in the headset card and bring new messages into view.
const shopCard = document.querySelector('.perf-answer');
if (shopCard) {
  if (prefersReducedMotion) {
    shopCard.dataset.shopPhase = 'team';
  } else {
    let shopVisible = false;
    let shopTimers = [];
    const shopThread = shopCard.querySelector('.shop-thread');
    const clearShopTimers = () => {
      shopTimers.forEach(clearTimeout);
      shopTimers = [];
    };
    const showShopPhase = phase => {
      shopCard.dataset.shopPhase = phase;
      requestAnimationFrame(() => shopThread?.scrollTo({ top: shopThread.scrollHeight, behavior: 'smooth' }));
    };
    const playShopChat = () => {
      if (!shopVisible || document.hidden) return;
      clearShopTimers();
      shopCard.dataset.shopPhase = 'intro';
      shopThread?.scrollTo({ top: 0, behavior: 'auto' });
      shopTimers.push(setTimeout(() => {
        if (shopVisible && !document.hidden) showShopPhase('buyer');
      }, 2750));
      shopTimers.push(setTimeout(() => {
        if (shopVisible && !document.hidden) showShopPhase('team');
      }, 4550));
    };
    const shopObserver = new IntersectionObserver(([entry]) => {
      shopVisible = entry.isIntersecting;
      if (shopVisible) playShopChat();
      else {
        clearShopTimers();
        shopCard.dataset.shopPhase = 'team';
      }
    }, { threshold: .35 });
    shopObserver.observe(shopCard);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearShopTimers();
        shopCard.dataset.shopPhase = 'team';
      } else if (shopVisible) playShopChat();
    });
  }
}

// Replay the partner example while visible: objection, approved sources, reply, handoff.
const partnersVisual = document.querySelector('.partners-visual');
if (partnersVisual && !prefersReducedMotion) {
  const storyLines = [...partnersVisual.querySelectorAll('.partners-story-line')];
  let partnersVisible = false;
  let partnersTimers = [];
  const clearPartnersTimers = () => {
    partnersTimers.forEach(clearTimeout);
    partnersTimers = [];
  };
  const showPartnersStep = (step, count) => {
    partnersVisual.dataset.storyStep = step;
    storyLines.forEach((line, index) => line.classList.toggle('is-shown', index < count));
  };
  const playPartnersStory = () => {
    if (!partnersVisible || document.hidden) return;
    clearPartnersTimers();
    showPartnersStep('start', 0);
    [
      [520, 'question', 1],
      [1250, 'sources', 1],
      [1650, 'typing', 1],
      [2550, 'answer', 2],
      [4550, 'followup', 3],
      [5950, 'handoff', 4],
      [7050, 'complete', 5],
    ].forEach(([delay, step, count]) => {
      partnersTimers.push(setTimeout(() => {
        if (partnersVisible && !document.hidden) showPartnersStep(step, count);
      }, delay));
    });
    partnersTimers.push(setTimeout(playPartnersStory, 12500));
  };
  partnersVisual.classList.add('story-ready');
  showPartnersStep('start', 0);
  const partnersObserver = new IntersectionObserver(([entry]) => {
    partnersVisible = entry.isIntersecting;
    if (partnersVisible) playPartnersStory();
    else {
      clearPartnersTimers();
      showPartnersStep('complete', storyLines.length);
    }
  }, { threshold: .2 });
  partnersObserver.observe(partnersVisual);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearPartnersTimers();
      showPartnersStep('complete', storyLines.length);
    } else if (partnersVisible) playPartnersStory();
  });
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
let productAutoTimer;
let productAutoVisible = false;
let productAutoIndex = 0;
function stopProductAuto() {
  clearTimeout(productAutoTimer);
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
  const autoOrder = [1, 2, 0];
  const advanceProductDemo = () => {
    if (!productAutoVisible || productAutoDone || document.hidden) return;
    selectConversation(inboxItems[autoOrder[productAutoIndex % autoOrder.length]]);
    productAutoIndex += 1;
    productAutoTimer = setTimeout(advanceProductDemo, 3300);
  };
  const productObserver = new IntersectionObserver(([entry]) => {
    productAutoVisible = entry.isIntersecting;
    clearTimeout(productAutoTimer);
    if (productAutoVisible && !productAutoDone && !document.hidden) {
      productAutoTimer = setTimeout(advanceProductDemo, 1050);
    }
  }, { threshold: .35 });
  productObserver.observe(productStage);
  document.addEventListener('visibilitychange', () => {
    clearTimeout(productAutoTimer);
    if (!document.hidden && productAutoVisible && !productAutoDone) {
      productAutoTimer = setTimeout(advanceProductDemo, 1050);
    }
  });
}
