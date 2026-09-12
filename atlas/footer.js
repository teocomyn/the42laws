// The links remain static HTML; this only adds motion and route-safe scrolling.
(() => {
 const footer=document.querySelector('.t42-footer');if(!footer)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!reduced.matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('t42-footer-revealed');observer.unobserve(entry.target);}},{threshold:.12});
  footer.querySelectorAll('.t42-footer-top,.t42-footer-brandline').forEach(element=>observer.observe(element));
 }
 footer.querySelector('a[href="#page-top"]')?.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();const target=document.getElementById('page-top');
  if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
  window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});
 });
})();
