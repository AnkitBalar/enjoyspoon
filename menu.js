/* -------- Mobile menu -------- */
const navLinksEl = document.querySelector('.nav-links');
const burgerBtn = document.getElementById('burgerBtn');

function toggleMobileMenu(){
  const isOpen = navLinksEl.classList.toggle('mobile-open');
  burgerBtn.classList.toggle('open', isOpen);
  burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}
function closeMobileMenu(){
  navLinksEl.classList.remove('mobile-open');
  burgerBtn.classList.remove('open');
  burgerBtn.setAttribute('aria-expanded', 'false');
}
navLinksEl.querySelectorAll('a').forEach(a=>a.addEventListener('click', closeMobileMenu));
window.addEventListener('resize', ()=>{ if(window.innerWidth > 980) closeMobileMenu(); });
