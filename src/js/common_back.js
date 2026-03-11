function initScrollAnimation() {
  const elements = document.querySelectorAll('[data-animation]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  elements.forEach(el => observer.observe(el));
}

// Header
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// ===== 헤더: 스크롤 시 배경 solid 처리 =====
const header = document.getElementById('siteHeader');
const onHeader = () => {
  const y = window.scrollY || document.documentElement.scrollTop;
  header.classList.toggle('is-solid', y > 10);
};
onHeader();
window.addEventListener('scroll', onHeader, { passive:true });

// ===== 모바일 드로어(접근성: 포커스 트랩 + ESC 닫기) =====
const menuBtn = document.getElementById('menuBtn');
const backdrop = document.getElementById('drawerBackdrop');
const drawer = backdrop.querySelector('.drawer');
const closeBtn = document.getElementById('drawerClose');
let lastFocus = null;

function getFocusable(container){
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ];
  return Array.from(container.querySelectorAll(selectors.join(',')))
    .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
}

function openDrawer(){
  lastFocus = document.activeElement;
  backdrop.dataset.open = "true";
  menuBtn.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
  drawer.focus();
}
function closeDrawer(){
  backdrop.dataset.open = "false";
  menuBtn.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
  (lastFocus && lastFocus.focus) ? lastFocus.focus() : menuBtn.focus();
}

menuBtn.addEventListener('click', () => {
  const isOpen = backdrop.dataset.open === "true";
  isOpen ? closeDrawer() : openDrawer();
});
closeBtn.addEventListener('click', closeDrawer);
backdrop.addEventListener('click', (e) => { if(e.target === backdrop) closeDrawer(); });

document.addEventListener('keydown', (e) => {
  const isOpen = backdrop.dataset.open === "true";
  if(!isOpen) return;

  if(e.key === 'Escape'){ e.preventDefault(); closeDrawer(); return; }
  if(e.key !== 'Tab') return;

  const focusables = getFocusable(drawer);
  if(focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if(e.shiftKey && document.activeElement === first){
    e.preventDefault(); last.focus();
  } else if(!e.shiftKey && document.activeElement === last){
    e.preventDefault(); first.focus();
  }
});

drawer.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if(a) closeDrawer();
});

document.addEventListener('DOMContentLoaded', initScrollAnimation);
