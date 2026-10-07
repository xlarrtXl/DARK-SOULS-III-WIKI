/* ==========================================================================
   КОДЕКС ЛОТРИКА — общий скрипт для ВСЕХ страниц
   Подключается в конце <body>:  <script src="script.js" defer></script>

   ЧТО ДЕЛАЕТ (каждый пункт — отдельный блок ниже):
    1. Убирает класс no-js (значит, JavaScript работает)
    2. Анимации загрузки (.appear): снимает анимацию по окончании + запасной вариант
    3. Появление блоков при прокрутке (.rv)
    4. Шапка: тёмная подложка после прокрутки (.is-stuck)
    5. Мобильное меню (бургер)
    6. Оглавление «Содержание» в сайдбаре статьи
    7. Фильтры на странице «Боссы»
   ========================================================================== */
(function () {
  var d = document, b = d.body;

  /* 1. JS работает → показываем анимированные элементы (в CSS: .no-js .rv — видно сразу) */
  b.classList.remove('no-js');


  /* 2. АНИМАЦИИ ЗАГРУЗКИ ------------------------------------------------------
     Когда у элемента .appear кончилась CSS-анимация, ставим ему .is-in
     (анимация снимается, элемент остаётся в обычном состоянии). */
  var appear = [].slice.call(d.querySelectorAll('.appear'));
  appear.forEach(function (el) {
    el.addEventListener('animationend', function (e) {
      if (e.target === el) el.classList.add('is-in');
    }, { once: true });
  });
  /* Запасной вариант: если после двух кадров анимации не идут (старый браузер,
     отключены анимации) — сразу показываем всё как есть. */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      if (!appear.length) return;
      var running = appear[0].getAnimations && appear[0].getAnimations().some(function (a) {
        return a.playState === 'running' || a.playState === 'finished';
      });
      if (!running) appear.forEach(function (el) { el.classList.add('is-in'); });
    });
  });


  /* 3. ПОЯВЛЕНИЕ ПРИ ПРОКРУТКЕ ---------------------------------------------------
     Элементы с классом .rv получают .in, когда видны на 15%. Один раз, потом
     наблюдение снимается. Без IntersectionObserver показываем сразу. */
  var rv = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('in'); });
  }


  /* 4. ШАПКА ПРИ ПРОКРУТКЕ -------------------------------------------------------
     После 30px прокрутки добавляем .is-stuck — в CSS это тёмная размытая подложка. */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-stuck', window.scrollY > 30); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });


  /* 5. МОБИЛЬНОЕ МЕНЮ -------------------------------------------------------------
     Бургер включает/выключает body.menu-open (CSS показывает полноэкранное меню).
     Закрывается: по клику на пункт, по Escape, при расширении окна до десктопа. */
  var burger = d.querySelector('.burger');
  var desktop = window.matchMedia('(min-width: 901px)');
  function setMenu(open) {
    if (!burger) return;
    b.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  if (burger) {
    burger.addEventListener('click', function () { setMenu(!b.classList.contains('menu-open')); });
    d.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    desktop.addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }


  /* 6. ОГЛАВЛЕНИЕ СТАТЬИ ------------------------------------------------------------
     На страницах с .content и .sidebar собираем список ссылок на все h2 статьи
     и кладём его виджетом «Содержание» в начало сайдбара. Активный раздел подсвечивается. */
  var sidebar = d.querySelector('.sidebar');
  var heads = [].slice.call(d.querySelectorAll('.content .lore-section > h2'));
  if (sidebar && heads.length > 2) {
    var box = d.createElement('div');
    box.className = 'sidebar-widget';
    box.innerHTML = '<h3 class="widget-title">Содержание</h3><ul class="toc"></ul>';
    var list = box.querySelector('ul');
    var links = heads.map(function (h, i) {
      h.id = h.id || 'sec-' + (i + 1);
      var li = d.createElement('li');
      var a = d.createElement('a');
      a.href = '#' + h.id; a.textContent = h.textContent;
      li.appendChild(a); list.appendChild(li);
      return a;
    });
    sidebar.insertBefore(box, sidebar.firstChild);
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id); });
          }
        });
      }, { rootMargin: '-20% 0px -70% 0px' });
      heads.forEach(function (h) { spy.observe(h); });
    }
  }


  /* 7. ФИЛЬТРЫ НА СТРАНИЦЕ «БОССЫ» ----------------------------------------------------
     Кнопка .filter-btn имеет data-filter (all / req / opt / dlc),
     карточка .boss-card — data-rank. Несовпавшим ставим .is-hidden. */
  var btns = d.querySelectorAll('.filter-btn');
  var cards = d.querySelectorAll('.boss-card');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      btns.forEach(function (x) { x.classList.toggle('is-active', x === btn); });
      cards.forEach(function (c) {
        c.classList.toggle('is-hidden', f !== 'all' && c.getAttribute('data-rank') !== f);
      });
    });
  });
})();
