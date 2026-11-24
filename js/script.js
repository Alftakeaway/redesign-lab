/* =============================================================
   REDESIGN LAB — script
   Vanilla JS, zero dipendenze. Fa solo quattro cose:
     1. slider prima/dopo (trascinamento mouse/tasto, touch, tastiera)
     2. toggle "mostra cosa ho cambiato" (singolo e globale)
     3. form contatti via mailto (nessun backend)
     4. anno corrente nel footer
   ============================================================= */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. SLIDER PRIMA / DOPO
     ---------------------------------------------------------- */

  var STEP = 2;          // passo tastiera (%)
  var STEP_BIG = 10;     // passo PageUp / PageDown (%)

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function initCompare(root) {
    var media = root.querySelector('.compare__media');
    var handle = root.querySelector('.compare__handle');
    if (!media || !handle) return;

    var dragging = false;

    // posizione della maniglia, in percento (0 = tutto "prima", 100 = tutto "dopo")
    function getPos() {
      var raw = getComputedStyle(root).getPropertyValue('--pos');
      var value = parseFloat(raw);
      return isNaN(value) ? 50 : value;
    }

    function setPos(pct) {
      pct = clamp(Math.round(pct), 0, 100);
      root.style.setProperty('--pos', pct + '%');
      handle.setAttribute('aria-valuenow', String(pct));
      handle.setAttribute('aria-valuetext', pct + '% prima, ' + (100 - pct) + '% dopo');
    }

    // da evento pointer a percentuale rispetto al riquadro
    function posFromEvent(event) {
      var rect = media.getBoundingClientRect();
      if (!rect.width) return getPos();
      return ((event.clientX - rect.left) / rect.width) * 100;
    }

    function startDrag(event) {
      // solo tasto principale del mouse
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      dragging = true;
      root.classList.add('is-dragging');
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch (err) { /* ignora */ }
      setPos(posFromEvent(event));
    }

    function moveDrag(event) {
      if (!dragging) return;
      setPos(posFromEvent(event));
    }

    function endDrag(event) {
      if (!dragging) return;
      dragging = false;
      root.classList.remove('is-dragging');
      try { event.currentTarget.releasePointerCapture(event.pointerId); } catch (err) { /* ignora */ }
    }

    // trascinamento: sia partendo dal riquadro, sia dalla maniglia
    [media, handle].forEach(function (target) {
      target.addEventListener('pointerdown', startDrag);
      target.addEventListener('pointermove', moveDrag);
      target.addEventListener('pointerup', endDrag);
      target.addEventListener('pointercancel', endDrag);
    });

    // doppio click / doppio tap: la maniglia torna al centro
    media.addEventListener('dblclick', function () { setPos(50); });

    // tastiera
    handle.addEventListener('keydown', function (event) {
      var current = getPos();
      var next = null;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          next = current - STEP;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          next = current + STEP;
          break;
        case 'PageDown':
          next = current - STEP_BIG;
          break;
        case 'PageUp':
          next = current + STEP_BIG;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = 100;
          break;
        case 'Enter':
        case ' ':
          next = 50;   // riporta la maniglia al centro
          break;
        default:
          return;
      }

      event.preventDefault();
      root.classList.add('is-dragging');   // nessuna transizione: risposta immediata
      setPos(next);
      window.requestAnimationFrame(function () {
        root.classList.remove('is-dragging');
      });
    });

    setPos(getPos());   // sincronizza subito valori ARIA
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-compare]'),
    initCompare
  );


  /* ----------------------------------------------------------
     2. TOGGLE "MOSTRA COSA HO CAMBIATO"
     ---------------------------------------------------------- */

  var LABEL_ON = 'Mostra cosa ho cambiato';
  var LABEL_OFF = 'Nascondi le modifiche';

  function setExpanded(button, expanded) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');

    var label = button.querySelector('[data-toggle-label]');
    if (label) label.textContent = expanded ? LABEL_OFF : LABEL_ON;

    if (panel) panel.hidden = !expanded;
    return button;
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-toggle]'),
    function (button) {
      button.addEventListener('click', function () {
        var expanded = button.getAttribute('aria-expanded') === 'true';
        setExpanded(button, !expanded);
        syncToggleAll();
      });
    }
  );

  var toggleAll = document.querySelector('[data-toggle-all]');

  function syncToggleAll() {
    if (!toggleAll) return;
    var all = Array.prototype.slice.call(document.querySelectorAll('[data-toggle]'));
    var openCount = all.filter(function (b) {
      return b.getAttribute('aria-expanded') === 'true';
    }).length;

    var allOpen = all.length > 0 && openCount === all.length;
    toggleAll.setAttribute('aria-pressed', allOpen ? 'true' : 'false');
    toggleAll.textContent = allOpen
      ? 'Nascondi tutte le spiegazioni'
      : 'Mostra tutte le spiegazioni';
  }

  if (toggleAll) {
    toggleAll.addEventListener('click', function () {
      var all = Array.prototype.slice.call(document.querySelectorAll('[data-toggle]'));
      var shouldOpen = toggleAll.getAttribute('aria-pressed') !== 'true';

      all.forEach(function (button) {
        setExpanded(button, shouldOpen);
      });
      syncToggleAll();

      // porta il primo pannello nella vista quando si apre tutto
      if (shouldOpen && all.length) {
        all[0].focus();
      }
    });
    syncToggleAll();
  }


  /* ----------------------------------------------------------
     3. FORM CONTATTI VIA MAILTO (nessun backend)
     ---------------------------------------------------------- */

  var form = document.getElementById('contact-form');

  if (form) {
    var status = document.getElementById('form-status');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      // validazione nativa HTML5 (required, type=email, type=url…)
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        if (typeof form.reportValidity === 'function') form.reportValidity();
        if (status) status.textContent = 'Controlla i campi evidenziati e riprova.';
        return;
      }

      var data = new FormData(form);
      var address = form.getAttribute('data-mailto') || 'alfredoforte.web@gmail.com';
      var get = function (name) {
        var value = data.get(name);
        return value === null ? '' : String(value).trim();
      };

      var subject = 'Richiesta redesign — ' + get('nome');
      var body = [
        'Nome: ' + get('nome'),
        'Email: ' + get('email'),
        'Sito attuale: ' + (get('sito') || '—'),
        'Settore: ' + get('settore'),
        '',
        'Il progetto:',
        get('messaggio')
      ].join('\n');

      if (status) {
        status.textContent = 'Sto aprendo il tuo programma di posta con il messaggio già compilato…';
      }

      window.location.href = 'mailto:' + address +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  }


  /* ----------------------------------------------------------
     4. ANNO CORRENTE NEL FOOTER
     ---------------------------------------------------------- */

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-year]'),
    function (el) {
      el.textContent = String(new Date().getFullYear());
    }
  );

})();
