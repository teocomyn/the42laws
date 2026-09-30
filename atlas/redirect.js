/* Portable static-preview fallback. Production redirects are HTTP 308 in vercel.json. */
(function(){'use strict';const link=document.querySelector('[data-seo-redirect]');if(!link)return;const target=new URL(link.getAttribute('href'),location.origin);if(target.origin!==location.origin)return;location.replace(target.pathname+location.search+location.hash);})();
