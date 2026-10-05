const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const revealTargets = [...document.querySelectorAll('.section-head, .performance-grid .card, .planning-copy, .flow-card, .product-stage, .knowledge-stage, .knowledge-features > div, .story-tiles article, .step-card, .proof-photo, .proof-content, .assistant-stage, .faq-heading, .faq-list, .final-inner')];
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
}

const demoWindow = document.querySelector('.demo-window');
let demoPlayed = false;
function playDemo() {
  if (!demoWindow || prefersReducedMotion) return;
  demoWindow.classList.remove('playing');
  void demoWindow.offsetWidth;
  demoWindow.classList.add('playing');
  demoPlayed = true;
}
document.querySelector('.demo-replay')?.addEventListener('click', playDemo);
const videoDialog = document.getElementById('video-dialog');
const demoVideo = videoDialog?.querySelector('video');
document.getElementById('watch-demo')?.addEventListener('click', () => {
  requestAnimationFrame(() => {
    videoDialog.showModal();
    demoVideo.currentTime = 0;
    demoVideo.play().catch(() => {});
  });
});
videoDialog?.querySelector('.video-close')?.addEventListener('click', () => videoDialog.close());
videoDialog?.addEventListener('click', event => { if (event.target === videoDialog) videoDialog.close(); });
videoDialog?.addEventListener('close', () => demoVideo.pause());
if (demoWindow && !prefersReducedMotion) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting) && !demoPlayed) {
      playDemo();
      observer.disconnect();
    }
  }, { threshold: .35 });
  observer.observe(demoWindow);
}

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
}
inboxItems.forEach(item => item.addEventListener('click', () => selectConversation(item)));
inboxFilters.forEach(filter => filter.addEventListener('click', () => {
  inboxFilters.forEach(button => { const active = button === filter; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  const kind = filter.dataset.filter;
  inboxItems.forEach(item => { item.hidden = kind !== 'all' && item.dataset.kind !== kind; });
  const firstVisible = inboxItems.find(item => !item.hidden);
  if (firstVisible) selectConversation(firstVisible);
}));

const examples = [
  { quote: '“Can someone explain which service is right for me?”', description: 'Ray can collect what the customer needs, then bring in your team for a personal recommendation.' },
  { quote: '“Is the Nova Mini available, and how much is it?”', description: 'Ray can answer with the price and availability from the sample business knowledge.' },
  { quote: '“Could I speak with someone about a custom order?”', description: 'Ray knows this needs a person and passes the conversation to the team with context.' }
];
let exampleIndex = 0;
function setExample(next) {
  exampleIndex = (next + examples.length) % examples.length;
  document.getElementById('example-quote').textContent = examples[exampleIndex].quote;
  document.getElementById('example-description').textContent = examples[exampleIndex].description;
  document.getElementById('example-count').textContent = `0${exampleIndex + 1} / 0${examples.length}`;
}
document.getElementById('example-prev')?.addEventListener('click', () => setExample(exampleIndex - 1));
document.getElementById('example-next')?.addEventListener('click', () => setExample(exampleIndex + 1));
