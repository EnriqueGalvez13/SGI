(()=>{
const track=document.querySelector('#review-carousel'),cards=[...track.querySelectorAll('.testimonial-card')];
let index=0,hovered=false,focused=false,visible=false,timer;
track.tabIndex=0;track.setAttribute('aria-live','off');
function schedule(){clearInterval(timer);if(!hovered&&!focused&&visible&&!document.hidden)timer=setInterval(()=>show((index+1)%cards.length),6500)}
function show(i){index=i;cards.forEach((card,n)=>{card.hidden=n!==index;card.classList.toggle('is-active',n===index)});schedule()}
function labels(){track.setAttribute('aria-label',document.documentElement.lang==='en'?'Automatic illustrative comments. Focus or hover to pause.':'Comentarios de ejemplo automáticos. Pausa al enfocar o pasar el cursor.')}
track.addEventListener('mouseenter',()=>{hovered=true;schedule()});track.addEventListener('mouseleave',()=>{hovered=false;schedule()});track.addEventListener('focusin',()=>{focused=true;schedule()});track.addEventListener('focusout',()=>setTimeout(()=>{focused=track.contains(document.activeElement);schedule()},0));document.addEventListener('visibilitychange',schedule);document.addEventListener('sgi-language-change',labels);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:.15}).observe(track);labels();show(0);
})();
