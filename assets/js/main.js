/* =====================================================================
   main.js — подключение простых окон без своей логики:
   глава комикса «Живая сказка» (cm) и «Как сделать игрушку» в «Елке» (em).
   Квиз подключается отдельно в quiz.js.
   Здесь же — плавающий QR: прячется, пока на экране виден другой QR
   (плашка перехода под первым экраном или финальный блок).
   ===================================================================== */
(function (modal) {
  'use strict';

  modal.setup('cm');
  modal.setup('em');

  // Плавающий QR. В браузерах без IntersectionObserver просто всегда виден.
  var fqr = document.getElementById('fqr');
  if (!fqr || !window.IntersectionObserver) return;

  var watched = document.querySelectorAll('.go, .final-go'),
      shown = [];   // shown[i] — виден ли сейчас i-й блок с QR
  var observer = new IntersectionObserver(function (entries) {
    var i, any = false;
    for (i = 0; i < entries.length; i++) {
      shown[+entries[i].target.getAttribute('data-qr')] = entries[i].isIntersecting;
    }
    for (i = 0; i < shown.length; i++) if (shown[i]) any = true;
    fqr.className = any ? 'fqr off' : 'fqr';
  });
  for (var k = 0; k < watched.length; k++) {
    watched[k].setAttribute('data-qr', k);
    shown[k] = false;
    observer.observe(watched[k]);
  }
})(PSB.modal);
