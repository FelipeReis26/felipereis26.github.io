document.documentElement.classList.add('js');

// A working copy of the Tessera board: tap a tile, it shows Playing, then ticks itself, with an Undo.
(function () {
  var board = document.getElementById('tessBoard');
  if (!board) return;
  var foot = document.getElementById('tessFoot');
  var count = document.getElementById('tessCount');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tiles = [].slice.call(board.querySelectorAll('.tile'));
  var undoTimer = null;

  function done() { return tiles.filter(function (t) { return t.classList.contains('done'); }).length; }
  function update() { count.textContent = done() + ' of ' + tiles.length + ' today'; }
  function say(html) { foot.innerHTML = html; }
  function idle() { say('<span>Tap a tile to play it</span>'); }

  tiles.forEach(function (t) {
    t.setAttribute('aria-pressed', t.classList.contains('done') ? 'true' : 'false');
    t.addEventListener('click', function () {
      var name = t.dataset.game;
      if (t.classList.contains('playing')) return;
      if (t.classList.contains('done')) {
        t.classList.remove('done'); t.setAttribute('aria-pressed', 'false'); update();
        say('<span>' + name + ' unticked</span>'); return;
      }
      t.classList.add('playing');
      say('<span>Playing ' + name + '…</span>');
      setTimeout(function () {
        t.classList.remove('playing'); t.classList.add('done'); t.setAttribute('aria-pressed', 'true'); update();
        say('<span>' + name + ' ticked</span><button type="button">Undo</button>');
        foot.querySelector('button').addEventListener('click', function () {
          t.classList.remove('done'); t.setAttribute('aria-pressed', 'false'); update(); idle();
        });
        clearTimeout(undoTimer); undoTimer = setTimeout(idle, 5000);
      }, reduced ? 300 : 1400);
    });
  });
  update(); idle();
})();

// Diagrams draw their arrows in once, the first time they scroll into view.
(function () {
  var diagrams = [].slice.call(document.querySelectorAll('.diagram'));
  diagrams.forEach(function (svg) {
    svg.querySelectorAll('.arrow').forEach(function (p) {
      try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
    });
  });
  if (!('IntersectionObserver' in window)) { diagrams.forEach(function (d) { d.classList.add('drawn'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  diagrams.forEach(function (d) { io.observe(d); });
})();

// Raise a ticket: opens an email in the visitor's own mail app. Nothing is stored.
(function () {
  var form = document.getElementById('ticketForm');
  if (!form) return;
  var sub = document.getElementById('tSubject'), body = document.getElementById('tBody');
  var pri = document.getElementById('tPriority'), err = document.getElementById('tErr');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var missing = [];
    [sub, body].forEach(function (f) {
      var bad = !f.value.trim();
      f.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) missing.push(f);
    });
    if (missing.length) { err.hidden = false; missing[0].focus(); return; }
    err.hidden = true;
    location.href = 'mailto:Felipe26lpe@gmail.com?subject=' + encodeURIComponent('[' + pri.value + '] ' + sub.value.trim()) +
      '&body=' + encodeURIComponent(body.value.trim());
  });
  [sub, body].forEach(function (f) {
    f.addEventListener('input', function () { if (f.value.trim()) f.setAttribute('aria-invalid', 'false'); });
  });
})();
