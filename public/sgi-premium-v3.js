/* SGI Premium 3.0: non-invasive navigation/accessibility enhancements. */
(function(){
  'use strict';
  const init=()=>{
    const progress=document.createElement('div');
    progress.className='sgi-v3-progress';
    progress.setAttribute('aria-hidden','true');
    document.body.appendChild(progress);
    let scheduled=false;
    function update(){
      const max=document.documentElement.scrollHeight-window.innerHeight;
      progress.style.width=(max>0?Math.min(100,Math.max(0,window.scrollY/max*100)):0)+'%';
      scheduled=false;
    }
    function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(update)}}
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    update();
    const skip=document.createElement('a');
    skip.className='sgi-v3-skip';
    skip.href='#servicios';
    skip.textContent='Saltar al contenido / Skip to content';
    document.body.prepend(skip);
    const lang=()=>document.documentElement.lang?.toLowerCase().startsWith('en')||
      localStorage.getItem('sgi-lang')==='en';
    function translate(){
      document.querySelectorAll('[data-sgi-v3-quote]').forEach(el=>{
        el.innerHTML=lang()?'Request a quote <span aria-hidden="true">↗</span>':'Solicitar cotización <span aria-hidden="true">↗</span>';
      });
    }
    translate();
    document.querySelectorAll('[data-lang], [data-language], #lang-toggle, .lang-toggle').forEach(el=>
      el.addEventListener('click',()=>setTimeout(translate,50)));
    const obs=new MutationObserver(translate);
    obs.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    // Keep original forms, upload handlers, 3D viewer, CMS, and routing untouched.
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
