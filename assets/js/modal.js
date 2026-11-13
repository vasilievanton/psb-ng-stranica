/* =====================================================================
   modal.js — окна поверх страницы (демо квиза, глава комикса, «Елка»).
   ES5 без библиотек. Создает общий объект window.PSB:
     PSB.dom   — мелкие помощники для работы с DOM;
     PSB.modal — подключение окна к кнопкам открытия и закрытия.

   Разметка окна (см. index.html), где prefix — короткое имя окна:
     #prefix        — само окно (.qm), видно при классе .on;
     #prefixOpen    — кнопка на странице, которая открывает окно;
     #prefixScroll  — прокручиваемая область окна;
     #prefixClose   — крестик, #prefixClose2 — ссылка «Закрыть».
   Окно закрывается крестиком, ссылкой «Закрыть» и клавишей Esc;
   после закрытия фокус возвращается на кнопку, которая его открыла.
   ===================================================================== */
var PSB = window.PSB || {};

PSB.dom = (function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }

  function hasClass(el, c) {
    return (' ' + el.className + ' ').indexOf(' ' + c + ' ') > -1;
  }

  function addClass(el, c) {
    if (el && !hasClass(el, c)) el.className = (el.className + ' ' + c).replace(/^\s+/, '');
  }

  function removeClass(el, c) {
    if (el) el.className = (' ' + el.className + ' ').replace(' ' + c + ' ', ' ').replace(/^\s+|\s+$/g, '');
  }

  return { byId: byId, hasClass: hasClass, addClass: addClass, removeClass: removeClass };
})();

PSB.modal = (function (dom) {
  'use strict';

  var opened = null; // окно, открытое сейчас (одновременно открыто не больше одного)

  /**
   * Подключает окно с заданным префиксом.
   * options.onOpen — что сделать перед показом окна (например, сбросить квиз).
   * Возвращает { box, open, close } или null, если окна нет на странице.
   */
  function setup(prefix, options) {
    var box = dom.byId(prefix),
        openBtn = dom.byId(prefix + 'Open'),
        lastFocus = null,
        onOpen = options && options.onOpen;

    if (!box || !openBtn) return null;

    function open() {
      lastFocus = document.activeElement;
      if (onOpen) onOpen();
      dom.addClass(box, 'on');
      dom.addClass(document.body, 'qm-open'); // запрещает прокрутку страницы под окном
      dom.byId(prefix + 'Scroll').scrollTop = 0;
      dom.byId(prefix + 'Close').focus();
      opened = api;
    }

    function close() {
      dom.removeClass(box, 'on');
      dom.removeClass(document.body, 'qm-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      opened = null;
    }

    var api = { box: box, open: open, close: close };

    openBtn.onclick = open;
    dom.byId(prefix + 'Close').onclick = close;
    dom.byId(prefix + 'Close2').onclick = close;
    return api;
  }

  // Esc закрывает открытое окно
  document.onkeydown = function (e) {
    e = e || window.event;
    if (opened && e.keyCode === 27) opened.close();
  };

  return { setup: setup };
})(PSB.dom);
