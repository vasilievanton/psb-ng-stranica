/* =====================================================================
   quiz.js — демо квиза «Спроси дорогу» в окне поверх страницы.
   Показывает три вопроса из quiz-data.js, после каждого ответа —
   пояснение, в конце — итог «Путь найден» со ссылкой на платформу.
   Ответы никуда не отправляются, баллы не считаются.
   Зависит от modal.js и quiz-data.js (подключаются раньше).
   ===================================================================== */
(function (dom, modal, questions) {
  'use strict';

  var $ = dom.byId;

  // Снежинка в кружке слева от каждого варианта ответа
  var OPTION_ICON =
    '<span class="ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">' +
    '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
    '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17"/>' +
    '<path d="m9.5 3.8 2.5 2.4 2.5-2.4M9.5 20.2l2.5-2.4 2.5 2.4M3.6 10.3l3.3-1 -.8-3.3M20.4 13.7l-3.3 1 .8 3.3M20.4 10.3l-3.3-1 .8-3.3M3.6 13.7l3.3 1-.8 3.3"/>' +
    '</g></svg></span>';

  var box = $('qm');
  var current = 0; // номер текущего вопроса

  // Записывает текст в элемент (без разбора HTML)
  function setText(el, text) {
    if ('textContent' in el) el.textContent = text;
    else el.innerText = text;
  }

  // Полоски прогресса над вопросом
  function renderProgress() {
    var bars = $('qmBar').getElementsByTagName('span'), k;
    for (k = 0; k < bars.length; k++) {
      bars[k].className = k < current ? 'done' : (k === current ? 'cur' : '');
    }
  }

  // Показывает вопрос с номером i
  function showQuestion(i) {
    var q = questions[i], list = $('qmOpts'), word = $('qmWord'), k, li, btn;

    dom.removeClass(box, 'done');
    dom.removeClass($('qmExpl'), 'on');
    dom.removeClass($('qmNext'), 'on');
    dom.removeClass($('qmEnd'), 'on');
    renderProgress();

    // Слово на табличке; длинные слова набираются мельче
    setText(word, q.word);
    word.className = q.word.length > 14 ? 's3' : (q.word.length > 9 ? 's2' : '');

    list.innerHTML = '';
    for (k = 0; k < q.opts.length; k++) {
      li = document.createElement('li');
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qm-opt';
      btn.innerHTML = OPTION_ICON + '<span class="tx"></span>';
      setText(btn.lastChild, q.opts[k]);
      btn.setAttribute('data-i', k);
      btn.onclick = onAnswer;
      li.appendChild(btn);
      list.appendChild(li);
    }
    $('qmScroll').scrollTop = 0;
  }

  // Ответ: подсвечивает варианты и показывает пояснение
  function onAnswer() {
    var q = questions[current],
        pick = +this.getAttribute('data-i'),
        buttons = $('qmOpts').getElementsByTagName('button'),
        good = pick === q.ok,
        verdict = $('qmVerdict'),
        right = $('qmRight'),
        expl = $('qmExpl'),
        k;

    if (buttons[0].disabled) return; // уже ответили

    for (k = 0; k < buttons.length; k++) {
      buttons[k].disabled = true;
      if (k === q.ok) dom.addClass(buttons[k], 'ok');
      else if (k === pick) dom.addClass(buttons[k], 'bad');
      else dom.addClass(buttons[k], 'dim');
    }

    verdict.className = 'qm-verdict' + (good ? '' : ' bad');
    setText(verdict, good ? '★ Верно!' : 'Мимо');
    setText(right, good ? '' : 'Правильный ответ — «' + q.opts[q.ok] + '». Теперь и ты знаешь!');
    right.className = 'qm-right' + (good ? '' : ' on');

    setText($('qmEw'), q.word);
    setText($('qmWhere'), q.where);
    setText($('qmText'), q.text);
    $('qmImg').src = q.img;
    $('qmImg').alt = q.word;
    setText($('qmNext'), current < questions.length - 1 ? 'Следующий вопрос' : 'К итогам');

    dom.addClass(expl, 'on');
    dom.addClass($('qmNext'), 'on');
    if (expl.scrollIntoView) expl.scrollIntoView(false);
  }

  // Следующий вопрос или итог после последнего
  function onNext() {
    if (current < questions.length - 1) {
      current++;
      showQuestion(current);
      return;
    }
    dom.addClass(box, 'done');
    dom.addClass($('qmEnd'), 'on');
    $('qmScroll').scrollTop = 0;
  }

  function restart() {
    current = 0;
    showQuestion(0);
  }

  // Подключаем окно; при каждом открытии квиз начинается сначала
  if (!modal.setup('qm', { onOpen: restart })) return;
  $('qmNext').onclick = onNext;
  $('qmAgain').onclick = restart;
})(PSB.dom, PSB.modal, PSB.quizQuestions);
