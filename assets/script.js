(function(){'use strict';
/* Persistent Home / Language Services / Services tab strip (always visible,
   both mobile and desktop) — pulled out of the hamburger drawer so only
   "More", Careers, Get Started stay behind the hamburger on mobile.
   A utility bar (phone/email/social) is built from the footer's real links,
   which keeps every page in sync automatically without hand-editing each one. */
(function initNav(){
  const inner=document.querySelector('.nav-inner');
  const navLinks=document.querySelector('.nav-links');
  const siteNav=document.querySelector('.site-nav');
  const toggleBtn=document.querySelector('.nav-mobile-toggle');
  if(!inner||!navLinks||!siteNav) return;

  const tabs=document.createElement('div');
  tabs.className='nav-tabs';
  const homeLink=navLinks.querySelector('a.current')||navLinks.querySelector('a[href$="index.html"]');
  const drops=[...navLinks.querySelectorAll(':scope > .nav-drop')];
  const lsDrop=drops.find(d=>d.classList.contains('nav-priority'));
  const svcDrop=drops.find(d=>d!==lsDrop && !d.querySelector('.nav-drop-menu-simple'));

  function addShortLabel(drop,full,short){
    if(!drop) return;
    const btn=drop.querySelector('button');
    if(!btn) return;
    const chevron=btn.querySelector('span[aria-hidden="true"]');
    btn.innerHTML='';
    const fullSpan=document.createElement('span'); fullSpan.className='tab-label-full'; fullSpan.textContent=full;
    const shortSpan=document.createElement('span'); shortSpan.className='tab-label-short'; shortSpan.textContent=short;
    btn.appendChild(fullSpan); btn.appendChild(shortSpan);
    if(chevron) btn.appendChild(chevron);
  }
  addShortLabel(lsDrop,'Language Services','LS');
  addShortLabel(svcDrop,'Services','Services');

  [homeLink,lsDrop,svcDrop].forEach(el=>{ if(el) tabs.appendChild(el); });
  inner.insertBefore(tabs, toggleBtn||navLinks);

  const footerSocial=document.querySelector('.footer-social-col');
  const footerContact=document.querySelector('.footer-contact');
  if(footerSocial||footerContact){
    const util=document.createElement('div');
    util.className='nav-utility';
    const utilInner=document.createElement('div');
    utilInner.className='nav-utility-inner';

    if(footerContact){
      const c=document.createElement('div');
      c.className='nav-utility-contact';
      c.innerHTML=footerContact.innerHTML;
      utilInner.appendChild(c);
    }
    if(footerSocial){
      const s=document.createElement('div');
      s.className='nav-utility-social';
      footerSocial.querySelectorAll('a').forEach(a=>{
        const href=a.getAttribute('href');
        if(!href||href==='#') return;
        const icon=a.querySelector('.footer-ic');
        if(!icon) return;
        const link=document.createElement('a');
        link.href=href; link.target='_blank'; link.rel='noopener';
        link.setAttribute('aria-label',a.textContent.trim().split('—')[0].trim());
        link.appendChild(icon.cloneNode(true));
        s.appendChild(link);
      });
      if(s.children.length) utilInner.appendChild(s);
    }
    util.appendChild(utilInner);
    siteNav.insertBefore(util,inner);
  }
})();

const toggle=document.querySelector('.nav-mobile-toggle'), nav=document.querySelector('.nav-links');
function closeMenu(){if(nav)nav.classList.remove('open');if(toggle)toggle.setAttribute('aria-expanded','false');document.querySelectorAll('.nav-drop.open').forEach(x=>x.classList.remove('open'));}
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
document.querySelectorAll('.nav-drop > button').forEach(btn=>btn.addEventListener('click',e=>{if(window.innerWidth<=980){e.preventDefault();const box=btn.parentElement;const open=box.classList.toggle('open');btn.setAttribute('aria-expanded',String(open));}}));
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{if(window.innerWidth<=980)closeMenu();}));
document.addEventListener('click',e=>{if(window.innerWidth>980&&!e.target.closest('.nav-drop'))document.querySelectorAll('.nav-drop.open').forEach(x=>x.classList.remove('open'));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();const c=document.querySelector('.chat-panel');if(c)c.classList.remove('open');}});
window.addEventListener('resize',()=>{if(window.innerWidth>980)closeMenu();});

/* hero carousel */
const heroSlides=[...document.querySelectorAll('.hero-slide')], heroDots=[...document.querySelectorAll('.hero-slide-dots span')];
let heroIndex=0;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(heroSlides.length&&!reduceMotion){setInterval(()=>{heroSlides[heroIndex].classList.remove('is-active'); heroDots[heroIndex]?.classList.remove('active'); heroIndex=(heroIndex+1)%heroSlides.length; heroSlides[heroIndex].classList.add('is-active'); heroDots[heroIndex]?.classList.add('active');},4200);}

/* "Twin Technologies in action" crossfade slideshow */
const ttSlides=[...document.querySelectorAll('.tt-slide')];
let ttIndex=0;
if(ttSlides.length&&!reduceMotion){setInterval(()=>{ttSlides[ttIndex].classList.remove('is-active'); ttIndex=(ttIndex+1)%ttSlides.length; ttSlides[ttIndex].classList.add('is-active');},3400);}

/* curriculum level tabs (Basic / Intermediate / Advanced) */
document.querySelectorAll('.curric-tab').forEach(tab=>tab.addEventListener('click',()=>{
  const group=tab.closest('.curric-tabs').parentElement;
  group.querySelectorAll('.curric-tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  group.querySelectorAll('.curric-panel').forEach(p=>p.classList.toggle('active',p.dataset.level===tab.dataset.level));
}));

/* accordions (used by curriculum, FAQ panel, service pages) */
document.querySelectorAll('.accordion-head').forEach(head=>head.addEventListener('click',()=>{const item=head.parentElement;item.classList.toggle('open');head.setAttribute('aria-expanded',String(item.classList.contains('open')));}));

/* multi-step forms (apply / careers / service-request) */
document.querySelectorAll('[data-next-step]').forEach(btn=>btn.addEventListener('click',()=>{const shell=btn.closest('.apply-card')||document;const steps=[...shell.querySelectorAll('.apply-step')],current=steps.findIndex(s=>s.classList.contains('active'));const required=steps[current]?.querySelectorAll('[required]')||[];let ok=true;required.forEach(f=>{if(!f.checkValidity()){f.reportValidity();ok=false;}});if(!ok)return;steps[current].classList.remove('active');if(steps[current+1])steps[current+1].classList.add('active');updateSteps(shell,current+1);}));
document.querySelectorAll('[data-prev-step]').forEach(btn=>btn.addEventListener('click',()=>{const shell=btn.closest('.apply-card')||document;const steps=[...shell.querySelectorAll('.apply-step')],current=steps.findIndex(s=>s.classList.contains('active'));if(current>0){steps[current].classList.remove('active');steps[current-1].classList.add('active');updateSteps(shell,current-1);}}));
function updateSteps(shell,i){shell.querySelectorAll('.step').forEach((s,n)=>{s.classList.toggle('active',n===i);s.classList.toggle('done',n<i);});}

/* checkbox pick-cards: visual checked state (fallback for browsers without :has()) + rate-field reveal */
document.querySelectorAll('.pick-card input[type=checkbox]').forEach(inp=>{
  const sync=()=>inp.closest('.pick-card').classList.toggle('is-checked',inp.checked);
  inp.addEventListener('change',sync); sync();
});

/* Academy course-selection duration logic: >50% of offered courses selected => 1 month, else 2 weeks */
const courseForm=document.querySelector('[data-course-form]');
if(courseForm){
  const boxes=[...courseForm.querySelectorAll('input[data-course]')];
  const out=document.querySelector('[data-duration-output]');
  const countOut=document.querySelector('[data-duration-count]');
  function recalc(){
    const total=boxes.length, picked=boxes.filter(b=>b.checked).length;
    const pct=total?picked/total:0;
    const duration=pct>0.5?'1 month':'2 weeks';
    if(out)out.textContent=picked?duration:'Select courses to see an estimate';
    if(countOut)countOut.textContent=picked+' of '+total+' courses selected';
    const hidden=courseForm.querySelector('input[name="selectedCourses"]');
    if(hidden)hidden.value=boxes.filter(b=>b.checked).map(b=>b.value).join(', ');
    const durHidden=courseForm.querySelector('input[name="estimatedDuration"]');
    if(durHidden)durHidden.value=picked?duration:'';
  }
  boxes.forEach(b=>b.addEventListener('change',recalc));
  recalc();
}

/* Services page: bundle vs individual selection summary */
const svcForm=document.querySelector('[data-services-form]');
if(svcForm){
  const boxes=[...svcForm.querySelectorAll('input[data-service]')];
  const hidden=svcForm.querySelector('input[name="selectedServices"]');
  function recalc(){ if(hidden) hidden.value=boxes.filter(b=>b.checked).map(b=>b.value).join(', '); }
  boxes.forEach(b=>b.addEventListener('change',recalc)); recalc();
}

/* Careers page: rate fields + hidden summary */
const careersForm=document.querySelector('[data-careers-form]');
if(careersForm){
  const rows=[...careersForm.querySelectorAll('.pick-card.has-rate')];
  const hidden=careersForm.querySelector('input[name="servicesAndRates"]');
  function recalc(){
    const parts=rows.filter(r=>r.querySelector('input[type=checkbox]').checked).map(r=>{
      const name=r.querySelector('input[data-service]').value;
      const rate=r.querySelector('.rate-field input')?.value||'';
      return rate? (name+': '+rate) : name;
    });
    if(hidden) hidden.value=parts.join(' | ');
  }
  careersForm.addEventListener('change',recalc); recalc();
}

/* Scroll reveal + animated counters (skipped/instant for reduced-motion users) */
const revealEls=[...document.querySelectorAll('.reveal')];
const counterEls=[...document.querySelectorAll('[data-count]')];
function animateCount(el){
  const target=parseFloat(el.getAttribute('data-count'));
  const suffix=el.getAttribute('data-suffix')||'';
  if(reduceMotion){el.textContent=target.toLocaleString()+suffix;return;}
  const dur=1100,start=performance.now();
  function step(now){
    const p=Math.min(1,(now-start)/dur);
    const val=Math.floor(target*(1-Math.pow(1-p,3)));
    el.textContent=val.toLocaleString()+suffix;
    if(p<1)requestAnimationFrame(step);
    else el.textContent=target.toLocaleString()+suffix;
  }
  requestAnimationFrame(step);
}
if('IntersectionObserver' in window && !reduceMotion){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        if(e.target.hasAttribute('data-count')&&!e.target.dataset.counted){e.target.dataset.counted='1';animateCount(e.target);}
        io.unobserve(e.target);
      }
    });
  },{threshold:.2});
  revealEls.forEach(el=>io.observe(el));
  counterEls.forEach(el=>io.observe(el));
} else {
  revealEls.forEach(el=>el.classList.add('in-view'));
  counterEls.forEach(el=>{el.textContent=parseFloat(el.getAttribute('data-count')).toLocaleString()+(el.getAttribute('data-suffix')||'');});
}

/* floating FAQ panel (repurposed from live-chat widget) + WhatsApp stays a direct link */
const chatToggle=document.querySelector('.float-btn.chat'),chat=document.querySelector('.chat-panel'),chatClose=document.querySelector('.chat-close');
if(chatToggle&&chat)chatToggle.addEventListener('click',()=>chat.classList.toggle('open'));
if(chatClose&&chat)chatClose.addEventListener('click',()=>chat.classList.remove('open'));

/* PWA install banner */
let deferred=null;const banner=document.querySelector('.install-banner');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(banner&&!sessionStorage.getItem('tt-install-dismissed'))banner.classList.add('show');});
if(banner){banner.querySelector('.install-yes')?.addEventListener('click',async()=>{if(!deferred)return;deferred.prompt();await deferred.userChoice;deferred=null;banner.classList.remove('show')});banner.querySelector('.install-no')?.addEventListener('click',()=>{banner.classList.remove('show');sessionStorage.setItem('tt-install-dismissed','1')});window.addEventListener('appinstalled',()=>banner.classList.remove('show'));}

/* service worker (path-aware for nested pages) */
if('serviceWorker' in navigator){
  const dirs=(location.pathname.match(/\//g)||[]).length-1;
  const swPrefix=dirs>0?'../'.repeat(dirs):'';
  window.addEventListener('load',()=>navigator.serviceWorker.register(swPrefix+'sw.js').catch(()=>{}));
}

/* Form submission — career-application, general-inquiry, service-request, academy-enrollment
   all POST to the Cloudflare Pages Function at /api/submit */
document.querySelectorAll('form[action="/api/submit"]').forEach(form=>{
  form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const status=form.querySelector('[data-form-status]');
    const submitBtn=form.querySelector('button[type="submit"]');
    const originalLabel=submitBtn?submitBtn.textContent:'';
    if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='Sending…';}
    if(status){status.hidden=true;status.className='form-status';}
    try{
      const res=await fetch(form.action,{method:'POST',body:new FormData(form)});
      const data=await res.json().catch(()=>({ok:res.ok}));
      if(!res.ok||!data.ok) throw new Error(data.error||'Submission failed');

      const isApplyForm=form.id==='applyForm';
      if(isApplyForm){
        const shell=form.querySelector('.apply-card')||form;
        const steps=[...form.querySelectorAll('.apply-step')];
        const current=steps.findIndex(s=>s.classList.contains('active'));
        if(current>-1)steps[current].classList.remove('active');
        if(steps[steps.length-1])steps[steps.length-1].classList.add('active');
        updateSteps(shell,steps.length-1);
      }else if(status){
        status.hidden=false;
        status.className='form-status success';
        status.textContent="Thanks — we've received it. We'll be in touch shortly.";
        form.reset();
      }
    }catch(err){
      if(status){
        status.hidden=false;
        status.className='form-status error';
        status.textContent="Something went wrong sending that. Please try again, or email contact@twintechnologies.it.com directly.";
      }
    }finally{
      if(submitBtn){submitBtn.disabled=false;submitBtn.textContent=originalLabel;}
    }
  });
});
})();
