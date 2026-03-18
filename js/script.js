/* =============================================
   MODE SWITCHING
   ============================================= */
let currentMode = 'academic';

function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  const overlay = document.getElementById('modeOverlay');
  overlay.classList.add('flash');

  setTimeout(() => {
    document.body.className = mode;
    document.getElementById('btnIndustry').classList.toggle('active', mode === 'industry');
    document.getElementById('btnAcademic').classList.toggle('active', mode === 'academic');
    document.getElementById('navLogo').textContent = mode === 'industry' ? 'SGB / PORTFOLIO' : 'SGB / ACADEMIC';

    // Re-trigger scroll animations & counters
    document.querySelectorAll('.skill-card,.timeline-item,.hcard,.cert-badge,.edu-block,.paper-block,.stat').forEach(el => {
      el.classList.remove('visible');
      const hm = el.querySelector('.hcard-metric');
      const sn = el.querySelector('.stat-num');
      if (hm) { delete hm.dataset.animating; hm.innerHTML = '0<span style="font-size:18px">%</span>'; }
      if (sn) { delete sn.dataset.animating; sn.textContent = '0'; }
      observer.observe(el);
    });

    overlay.classList.remove('flash');
  }, 180);
}

/* =============================================
   CURSOR (industry)
   ============================================= */
const cursor = document.getElementById('cursor');
const trail = document.getElementById('cursorTrail');
let mx=0,my=0,tx=0,ty=0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx-6+'px'; cursor.style.top = my-6+'px';
});
setInterval(() => {
  tx += (mx-tx)*0.15; ty += (my-ty)*0.15;
  trail.style.left = tx-16+'px'; trail.style.top = ty-16+'px';
}, 16);
document.querySelectorAll('a,.btn,.mode-btn').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.transform='scale(2)'; trail.style.transform='scale(1.5)' });
  el.addEventListener('mouseleave', () => { cursor.style.transform='scale(1)'; trail.style.transform='scale(1)' });
});

/* =============================================
   SCROLL PROGRESS
   ============================================= */
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  document.getElementById('scrollBar').style.width = pct + '%';
  checkVisibility();
});

/* =============================================
   PARTICLE CANVAS
   ============================================= */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
for (let i = 0; i < 75; i++) particles.push({
  x: Math.random()*2000, y: Math.random()*1200,
  vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3,
  r: Math.random()*1.4+.4, op: Math.random()*.4+.1
});
function drawParticles() {
  ctx.clearRect(0,0,W,H);
  particles.forEach(p => {
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(0,210,255,${p.op})`; ctx.fill();
  });
  particles.forEach((p,i) => {
    for(let j=i+1;j<particles.length;j++){
      const d=Math.hypot(p.x-particles[j].x,p.y-particles[j].y);
      if(d<110){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(0,210,255,${0.03*(1-d/110)})`;ctx.stroke();}
    }
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* =============================================
   TYPING ANIMATION (industry)
   ============================================= */
const titles = ['Data Engineer','Azure Specialist','ETL Developer','Cloud Architect','ML Researcher'];
let ti=0,ci=0,del=false;
const tyEl = document.getElementById('typingTitle');
function typeLoop() {
  const t = titles[ti];
  if (!del) { tyEl.textContent = t.slice(0,++ci); if(ci===t.length){setTimeout(()=>{del=true;typeLoop()},1600);return} }
  else { tyEl.textContent = t.slice(0,--ci); if(ci===0){del=false;ti=(ti+1)%titles.length} }
  setTimeout(typeLoop, del?55:95);
}
setTimeout(typeLoop, 1600);

/* =============================================
   COUNTER ANIMATION
   ============================================= */
function animCounter(el, target) {
  if (!el || el.dataset.animating) return;
  el.dataset.animating = 'true';
  let start = null;
  const dur = 1400;
  const step = ts => {
    if (!start) start = ts;
    const p = Math.min((ts-start)/dur, 1);
    const ease = 1 - Math.pow(1-p, 3);
    const val = Math.floor(ease * target);
    if (target === 962) { el.innerHTML = (val/100).toFixed(2); }
    else if (target === 25 || target === 30) { el.innerHTML = val + '<span style="font-size:18px">%</span>'; }
    else { el.innerHTML = val; }
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* =============================================
   INTERSECTION OBSERVER
   ============================================= */
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('hcard')) {
        const m = entry.target.querySelector('.hcard-metric');
        if (m && m.dataset.target) animCounter(m, parseInt(m.dataset.target));
      } else if (entry.target.classList.contains('stat')) {
        const num = entry.target.querySelector('.stat-num');
        if (num && num.dataset.target) animCounter(num, parseInt(num.dataset.target));
      }
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

function initObserver() {
  document.querySelectorAll('.skill-card,.timeline-item,.hcard,.cert-badge,.edu-block,.paper-block,.stat').forEach(el => {
    observer.observe(el);
  });
  
  // Stagger items
  document.querySelectorAll('.skill-card').forEach((el,i) => el.style.transitionDelay = i*0.08+'s');
  document.querySelectorAll('.timeline-item').forEach((el,i) => el.style.transitionDelay = i*0.1+'s');
  document.querySelectorAll('.hcard').forEach((el,i) => el.style.transitionDelay = i*0.1+'s');
  document.querySelectorAll('.cert-badge').forEach((el,i) => el.style.transitionDelay = i*0.1+'s');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initObserver);
} else {
  initObserver();
}