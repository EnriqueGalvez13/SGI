(()=>{
const gallery=document.querySelector('#work-gallery'),buttons=[...document.querySelectorAll('[data-work-filter]')],status=document.querySelector('#portfolio-status');let selected='all';
const categories={'base-1':'metalwork','base-2':'machining','base-3':'facilities','base-4':'automation','base-5':'facilities','base-6':'machining','base-7':'molding'};
function filter(){let shown=0;gallery.querySelectorAll('figure').forEach(fig=>{const category=categories[fig.dataset.baseMedia]||'other';const hidden=selected!=='all'&&category!==selected;fig.classList.toggle('portfolio-filtered',hidden);if(!hidden&&!fig.hidden)shown++});buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workFilter===selected)));const en=document.documentElement.lang==='en';const message=shown?(en?`${shown} documented work ${shown===1?'item':'items'}`:`${shown} ${shown===1?'trabajo documentado':'trabajos documentados'}`):(en?'No work available in this category.':'No hay trabajos disponibles en esta categoría.');if(status.textContent!==message)status.textContent=message}
buttons.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.workFilter;filter()}));
new MutationObserver(filter).observe(gallery,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});document.addEventListener('sgi-language-change',filter);filter();
})();
