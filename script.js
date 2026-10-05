const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
function replayMotion(element) {
  if (reduceMotion.matches) return;
  element.classList.remove('is-updating');
  void element.offsetWidth;
  element.classList.add('is-updating');
}

const menuToggle = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileNav.hidden = !open;
});
$$('#mobile-nav a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 851px)').addEventListener('change', (event) => { if (event.matches) closeMenu(); });
$('#year').textContent = new Date().getFullYear();

const leadScene = $('#lead-scene');
const leadSteps = $$('[data-lead-step]');
const qualDisplay = $('#qual-display');
const qualSteps = $$('[data-qual-step]');
const qualStates = [
  { quote: '“Can we talk next week?”', status: 'New' },
  { quote: '“It’s for a launch next month.”', status: 'Interested' },
  { quote: '“Could someone call me Friday?”', status: 'Ready to talk' },
  { quote: '“Please have the team contact me.”', status: 'Qualified' },
];
let leadTimers = [];
let leadReplyTimers = [];
let qualTimers = [];
function clearTimers(timers) { timers.forEach(clearTimeout); timers.length = 0; }
function setRayMessageState(message, typing) {
  message.classList.toggle('is-typing', typing);
  message.classList.toggle('is-sent', !typing);
}
function setLeadStage(stage) {
  clearTimers(leadReplyTimers);
  leadScene.dataset.stage = String(stage);
  leadScene.dataset.entered = 'true';
  leadSteps.forEach((button) => {
    const current = Number(button.dataset.leadStep) === stage;
    button.classList.toggle('is-current', current);
    button.setAttribute('aria-pressed', String(current));
  });
  const firstRay = $('.lead-message-ray-first');
  const finalRay = $('.lead-message-ray-last');
  const animateFirstReply = stage === 2 && !reduceMotion.matches;
  const animateFinalReply = stage === 4 && !reduceMotion.matches;
  setRayMessageState(firstRay, animateFirstReply);
  setRayMessageState(finalRay, animateFinalReply);
  if (animateFirstReply) leadReplyTimers.push(setTimeout(() => setRayMessageState(firstRay, false), 760));
  if (animateFinalReply) {
    $('#lead-status-text').textContent = 'Ray is replying';
    $('#lead-status-detail').textContent = '· Preparing a handoff';
    leadReplyTimers.push(setTimeout(() => {
      setRayMessageState(finalRay, false);
      $('#lead-status-text').textContent = 'Qualified inquiry';
      $('#lead-status-detail').textContent = '· Ready for your team';
    }, 830));
  } else {
    $('#lead-status-text').textContent = stage === 4 ? 'Qualified inquiry' : stage === 3 ? 'Clear intent found' : 'Conversation started';
    $('#lead-status-detail').textContent = stage === 4 ? '· Ready for your team' : stage === 3 ? '· Project next month, call Friday' : '· Ray is replying';
  }
}
function playLead() {
  clearTimers(leadTimers);
  setLeadStage(0);
  if (reduceMotion.matches) { setLeadStage(4); return; }
  for (let stage = 1; stage <= 4; stage++) leadTimers.push(setTimeout(() => setLeadStage(stage), stage * 1300));
}
leadSteps.forEach((button) => button.addEventListener('click', () => { clearTimers(leadTimers); setLeadStage(Number(button.dataset.leadStep)); }));
function setQualStage(stage) {
  qualDisplay.dataset.stage = String(stage);
  qualSteps.forEach((button) => {
    const current = Number(button.dataset.qualStep) === stage;
    button.classList.toggle('is-current', current);
    button.setAttribute('aria-pressed', String(current));
  });
  $('#qual-current').textContent = qualStates[stage].quote;
  $('#qual-status').textContent = qualStates[stage].status;
  replayMotion($('#qual-current'));
  replayMotion($('#qual-status'));
}
function playQualification() {
  clearTimers(qualTimers);
  setQualStage(0);
  if (reduceMotion.matches) { setQualStage(3); return; }
  for (let stage = 1; stage <= 3; stage++) qualTimers.push(setTimeout(() => setQualStage(stage), stage * 1500));
}
qualSteps.forEach((button) => button.addEventListener('click', () => { clearTimers(qualTimers); setQualStage(Number(button.dataset.qualStep)); }));
setLeadStage(0);
setQualStage(0);
const storyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    if (entry.target.id === 'lead-story') playLead();
    if (entry.target.id === 'qualification') playQualification();
    storyObserver.unobserve(entry.target);
  });
}, { threshold: .25 });
storyObserver.observe($('#lead-story'));
storyObserver.observe($('#qualification'));

let followUpShown = false;
$('#nurture-button').addEventListener('click', () => {
  followUpShown = !followUpShown;
  $('#nurture-state').textContent = followUpShown ? 'Follow-up sent' : 'Awaiting customer';
  $('#nurture-next').textContent = followUpShown ? '“Would you like me to arrange a call next week?”' : 'Follow-up tomorrow · 10:00 AM';
  $('#nurture-button').textContent = followUpShown ? 'Reset example ↻' : 'Show follow-up ↗';
  replayMotion($('.nurture-track'));
});

const supportScenarios = {
  routine: { count: '01 / 04', steps: [
    { kind: 'incoming', text: 'Can I move my appointment?' },
    { kind: 'source', text: 'Checking · Booking policy' },
    { kind: 'outgoing', text: 'Yes. You can reschedule up to 24 hours before.' },
  ], status: 'Resolved by Ray ✓' },
  refund: { count: '02 / 04', steps: [
    { kind: 'incoming', text: "I've been waiting five days and want a refund." },
    { kind: 'source', text: 'Refund request · Customer may be unhappy' },
    { kind: 'outgoing', text: "I'm bringing someone from the team into this conversation." },
  ], status: 'Priority increased · Needs you' },
  unknown: { count: '03 / 04', steps: [
    { kind: 'incoming', text: 'Can you build a custom plan for three locations?' },
    { kind: 'source', text: 'Checking · Service information' },
    { kind: 'outgoing', text: "I don't have a reliable answer. I'll ask your team to help." },
  ], status: 'Confidence low · Needs you' },
  repeat: { count: '04 / 04', steps: [
    { kind: 'incoming', text: 'When will someone call me?' },
    { kind: 'incoming', text: 'Any update?' },
    { kind: 'incoming', text: "I've already asked twice." },
    { kind: 'source', text: 'Repeated request detected · Customer may be unhappy' },
  ], status: 'Priority increased · Needs you' },
};
let supportTimers = [];
function clearSupportTimers() { supportTimers.forEach(clearTimeout); supportTimers = []; }
function renderSupportStep(step) {
  const element = document.createElement(step.kind === 'source' ? 'div' : 'p');
  element.className = step.kind === 'source' ? 'source-note entering' : 'chat-line ' + step.kind + ' entering';
  element.textContent = step.text;
  $('#support-messages').append(element);
}
function playSupport(key) {
  clearSupportTimers();
  const scenario = supportScenarios[key];
  $$('.scenario-button').forEach((button) => {
    const active = button.dataset.scenario === key;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#support-counter').textContent = scenario.count;
  $('#support-messages').replaceChildren();
  $('#support-status').textContent = 'Reading the conversation…';
  const stepDelay = reduceMotion.matches ? 0 : 260;
  scenario.steps.forEach((step, index) => {
    supportTimers.push(setTimeout(() => renderSupportStep(step), index * stepDelay));
  });
  supportTimers.push(setTimeout(() => {
    $('#support-status').textContent = scenario.status;
    $('#support-status').classList.remove('entering');
    void $('#support-status').offsetWidth;
    $('#support-status').classList.add('entering');
  }, scenario.steps.length * stepDelay));
}
$$('.scenario-button').forEach((button) => button.addEventListener('click', () => playSupport(button.dataset.scenario)));
const supportObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { playSupport('routine'); supportObserver.disconnect(); }
}, { threshold: .35 });
supportObserver.observe($('#support'));

let handoffTimers = [];
function clearHandoffTimers() { handoffTimers.forEach(clearTimeout); handoffTimers = []; }
function setHandoffState(value) {
  $('#handoff-state').textContent = value;
  replayMotion($('#handoff-state'));
}
function resetHandoff(animate = true) {
  clearHandoffTimers();
  $('#take-over').hidden = animate && !reduceMotion.matches;
  $('#human-owner').hidden = true;
  $('#handoff-ray').textContent = "I'll bring someone from the team into this conversation.";
  if (!animate || reduceMotion.matches) {
    setHandoffState('Needs you');
    $('#handoff-reason').hidden = false;
    $('#take-over').hidden = false;
    return;
  }
  setHandoffState('AI replying');
  $('#handoff-reason').hidden = true;
  handoffTimers.push(setTimeout(() => { setHandoffState('Pausing…'); }, 350));
  handoffTimers.push(setTimeout(() => {
    setHandoffState('Needs you');
    $('#handoff-reason').hidden = false;
    $('#take-over').hidden = false;
  }, 720));
}
$('#take-over').addEventListener('click', () => {
  clearHandoffTimers();
  setHandoffState('Human handling');
  $('#handoff-reason').hidden = true;
  $('#take-over').hidden = true;
  $('#human-owner').hidden = false;
});
$('#reset-handoff').addEventListener('click', () => resetHandoff(true));
const handoffObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { resetHandoff(true); handoffObserver.disconnect(); }
}, { threshold: .4 });
handoffObserver.observe($('#handoff'));

function activateTabs(buttons, selected, attribute, panelPrefix) {
  buttons.forEach((button) => {
    const active = button === selected;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    const panel = $('#' + panelPrefix + button.dataset[attribute]);
    if (panel) panel.hidden = !active;
  });
}
const setupTabs = $$('.setup-tab');
setupTabs.forEach((button, index) => {
  button.addEventListener('click', () => activateTabs(setupTabs, button, 'setup', 'setup-'));
  button.addEventListener('keydown', (event) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (delta) { event.preventDefault(); const target = setupTabs[(index + delta + setupTabs.length) % setupTabs.length]; activateTabs(setupTabs, target, 'setup', 'setup-'); target.focus(); }
  });
});
const channelMessages = {
  Instagram: 'New comment asking for a consultation',
  Facebook: 'Question about course enrollment',
  Messenger: 'Question about opening hours',
  WhatsApp: 'Customer asking to book a visit',
  TikTok: 'New question about an appointment',
};
$$('#channel-buttons [data-channel]').forEach((button) => button.addEventListener('click', () => {
  if (button.classList.contains('is-previewed')) return;
  button.classList.add('is-previewed');
  button.setAttribute('aria-pressed', 'true');
  $('.channel-state', button).textContent = 'Previewed ✓';
  const empty = $('.empty-line', $('#channel-inbox'));
  if (empty) empty.remove();
  const item = document.createElement('p');
  item.className = 'channel-entry';
  item.innerHTML = '<b></b><span></span>';
  item.prepend($('.social-icon', button).cloneNode(true));
  $('b', item).textContent = button.dataset.channel;
  $('span', item).textContent = channelMessages[button.dataset.channel];
  $('#channel-inbox').prepend(item);
}));
const knowledgeSequence = [
  { score: '72%', label: 'FAQs added' },
  { score: '83%', label: 'Services and pricing added' },
  { score: '92%', label: 'Ready to go live' },
];
const knowledgeButtons = $$('[data-knowledge]');
knowledgeButtons.slice(1).forEach((button) => { button.disabled = true; });
knowledgeButtons.forEach((button, index) => button.addEventListener('click', () => {
  $('#knowledge-score').textContent = knowledgeSequence[index].score;
  $('#knowledge-readiness').textContent = knowledgeSequence[index].label;
  replayMotion($('.knowledge-score'));
  button.disabled = true;
  $('span', button).textContent = 'Added ✓';
  if (knowledgeButtons[index + 1]) knowledgeButtons[index + 1].disabled = false;
}));
let testStep = 0;
$('#test-button').addEventListener('click', () => {
  testStep = (testStep + 1) % 3;
  $('#test-correction').hidden = testStep === 0;
  $('#test-answer').textContent = testStep === 2 ? 'Yes. You receive a certificate after completing all lessons.' : "I'm not sure about the certificate policy yet.";
  $('#test-result').textContent = testStep === 0 ? 'Ray needs your input.' : testStep === 1 ? 'Correction saved. Ask Ray again.' : 'Ray learned this answer ✓';
  $('#test-button').innerHTML = testStep === 0 ? 'Correct Ray <span aria-hidden="true">↗</span>' : testStep === 1 ? 'Ask again <span aria-hidden="true">↗</span>' : 'Reset demo <span aria-hidden="true">↻</span>';
  replayMotion($('.test-demo'));
});
const inboxRows = $$('.inbox-row');
function selectInboxRow(row) {
  inboxRows.forEach((item) => item.classList.toggle('is-selected', item === row));
  const owner = row.dataset.route === 'sales' ? 'Sales' : 'Support';
  $('#route-text').textContent = row.dataset.person + ' · ' + row.dataset.status + ' · Routed to ' + owner;
  replayMotion($('#route-line'));
}
let filterTimer;
$$('.inbox-filter button').forEach((button) => button.addEventListener('click', () => {
  $$('.inbox-filter button').forEach((item) => { const active = item === button; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); });
  clearTimeout(filterTimer);
  const target = button.dataset.filter;
  const matches = inboxRows.filter((row) => target === 'all' || row.dataset.kind === target);
  inboxRows.forEach((row) => { row.hidden = false; row.classList.toggle('is-hiding', !matches.includes(row)); });
  filterTimer = setTimeout(() => inboxRows.forEach((row) => { row.hidden = row.classList.contains('is-hiding'); }), reduceMotion.matches ? 0 : 240);
  if (matches.length && !matches.some((row) => row.classList.contains('is-selected'))) selectInboxRow(matches[0]);
}));
inboxRows.forEach((row) => row.addEventListener('click', () => selectInboxRow(row)));
const inboxEntranceObserver = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  $('#inbox-demo').dataset.entered = 'true';
  inboxEntranceObserver.disconnect();
}, { threshold: .18 });
inboxEntranceObserver.observe($('#inbox'));
$('#teach-ray').addEventListener('click', () => {
  $('#owner-answer').hidden = false;
  $('#learning-score').textContent = '91%';
  $('#learning-confirmation').innerHTML = 'Knowledge updated ✓ · Knowledge score <b id="learning-score">91%</b>';
  $('#teach-ray').textContent = 'Ray learned this answer ✓';
  $('#teach-ray').disabled = true;
});
const industries = {
  commerce:{ context:'E-commerce',question:'“Can I change my delivery address?”',detail:'Ray checks order policies and brings in your team when needed.' },
  salon:{ context:'Beauty & salons',question:'“Can I move my appointment to Friday?”',detail:'Ray handles booking questions and keeps the calendar moving.' },
  realestate:{ context:'Real estate',question:'“Is the home still open for viewings?”',detail:'Ray checks availability and captures the buyer’s preferred time.' },
  education:{ context:'Education',question:'“When does the next course start?”',detail:'Ray answers enrollment questions and follows up on interest.' },
  services:{ context:'Local services',question:'“Can someone come this Saturday?”',detail:'Ray collects the job, location, and preferred time for your team.' },
  professional:{ context:'Professional services',question:'“Which documents should I bring?”',detail:'Ray answers routine questions and flags complex requests.' },
};
const industryTabs = $$('.industry-button');
function showIndustry(button) {
  const value = industries[button.dataset.industry];
  industryTabs.forEach((tab) => { const active = tab === button; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  const panel = $('#industry-preview');
  panel.setAttribute('aria-labelledby', button.id);
  panel.dataset.theme = button.dataset.industry;
  panel.classList.remove('is-updating'); void panel.offsetWidth; panel.classList.add('is-updating');
  $('#industry-icon-use').setAttribute('href', '#industry-' + button.dataset.industry);
  $('#industry-context').textContent = value.context;
  $('#industry-question').textContent = value.question;
  $('#industry-detail').textContent = value.detail;
}
industryTabs.forEach((button, index) => {
  button.addEventListener('click', () => showIndustry(button));
  button.addEventListener('keydown', (event) => {
    const delta = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 0;
    if (delta) { event.preventDefault(); const target = industryTabs[(index + delta + industryTabs.length) % industryTabs.length]; showIndustry(target); target.focus(); }
  });
});
