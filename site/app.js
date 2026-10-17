/* Site team app (labourers & engineers). Demo only, sample data. */
(function () {
  'use strict';
  var B = window.BNB, esc = B.esc;
  B.load();
  var view = B.ui('sView') || 'labourer';
  var me = B.ui('sWorker') || 'w1';
  var eng = B.ui('sEng') || 'Suresh K';
  var esite = B.ui('sSite') || 'A';
  var ltab = B.ui('sLTab') || 'day';
  var main = document.getElementById('main');

  function header() {
    document.getElementById('viewSeg').innerHTML = [['labourer', 'Labourer'], ['engineer', 'Engineer']].map(function (v) {
      return '<button type="button" data-view="' + v[0] + '" aria-pressed="' + (v[0] === view) + '">' + v[1] + '</button>';
    }).join('');
    var ctx = document.getElementById('ctx'), tabs = document.getElementById('tabs');
    if (view === 'labourer') {
      if (!B.worker(me)) me = 'w1';
      var ws = B.get().workers.map(function (w) { return [w.id, w.name + ' · ' + B.SITES[w.site].short]; });
      ctx.innerHTML = '<label class="field" style="margin:0 0 4px"><span>Showing (sample person)</span>' + B.select('me', ws, me) + '</label>';
      tabs.innerHTML = [['day', 'My day'], ['week', 'My week']].map(function (t) { return '<button type="button" role="tab" data-ltab="' + t[0] + '" aria-selected="' + (t[0] === ltab) + '">' + t[1] + '</button>'; }).join('');
    } else {
      ctx.innerHTML = '<div class="two"><label class="field" style="margin:0 0 8px"><span>Acting as (sample)</span>' + B.select('eng', B.personOptions(['suresh', 'prakashr']), eng) + '</label>' +
        '<label class="field" style="margin:0 0 8px"><span>Site</span>' + B.select('esite', Object.keys(B.SITES).map(function (k) { return [k, B.SITES[k].short]; }), esite) + '</label></div>';
      tabs.innerHTML = '';
    }
  }
  function render() {
    header();
    main.innerHTML = view === 'labourer' ? (ltab === 'day' ? myDay() : myWeek()) : queue();
    document.getElementById('foot').innerHTML = B.demoFooter();
    bookHint();
  }
  var CORR_NOTE = '<div class="note">Corrections are normal. If a time is wrong, the office enters the fix with a reason, an engineer approves it, and your original entry always stays visible.</div>';

  /* ---------------- Labourer ---------------- */
  function myEntry(date) { return B.get().entries.find(function (e) { return e.worker === me && e.date === date; }); }
  function myDay() {
    var w = B.worker(me), c = B.crew(w.crew), e = myEntry(B.DEMO_DAY), st = B.get();
    var h = '<div class="sub"><span><b>' + esc(w.name) + '</b> · ' + esc(B.SITES[w.site].name) + '</span><span>Sat 17 Oct 2026 (demo day)</span></div>';
    if (!e) h += '<div class="card"><p>No entry for today yet.</p></div>';
    else if (e.status === 'absent') h += '<div class="card"><h2>Today</h2><p><span class="badge solid">Absent</span> ' + esc(e.note) + '</p><div class="stamps">' + B.stamp('Entered by', e.enteredBy, e.enteredAt) + B.stamp('Verified by', e.verifiedBy, e.verifiedAt) + '</div></div>';
    else {
      var eff = B.effective(e), p = B.payOf(e), cs = B.entryCorrections(e.id);
      h += '<div class="card"><div class="row"><div><div class="small muted">Today\'s pay</div><div class="big" data-mypay>' + (p.ok ? B.rs(p.pay) : '<span class="fix">Needs a fix</span>') + '</div></div><div style="text-align:right"><div class="small muted">Payable time</div><div class="big">' + (p.ok ? B.fmtHM(p.payable) : '—') + '</div></div></div>' +
        '<div class="facts"><div><span>In</span><b>' + B.fmtTime(eff.in) + '</b></div><div><span>Out</span><b>' + B.fmtTime(eff.out) + '</b></div><div><span>Break</span><b>' + esc(eff.breakMin) + ' min</b></div></div>' +
        (p.ok ? '' : '<p class="small fix">' + esc(p.error) + '. The office will fix it; no pay is lost.</p>') +
        '<div class="small muted">Rate ' + B.rs(w.rate) + '/hour (sample) · pay = payable minutes ÷ 60 × rate, rounded to the rupee</div>' +
        (e.note ? '<p class="small">' + esc(e.note) + '</p>' : '') +
        '<div class="stamps">' + B.stamp('Entered by', e.enteredBy, e.enteredAt) + B.stamp('Verified by', e.verifiedBy, e.verifiedAt) + '</div>';
      cs.forEach(function (k) {
        var fx = B.correctionEffect(k);
        h += '<div class="change"><b>' + (k.status === 'approved' ? 'Corrected' : k.status === 'pending' ? 'Correction waiting for approval' : 'Correction not approved') + '</b>: ' + esc(B.describeChanges(k)) +
          '<div class="small">Reason: ' + esc(k.reason) + '</div><div class="small">Original: ' + B.fmtHM(fx.before.payable) + ', ' + B.rs(fx.before.pay) + ' → ' + B.fmtHM(fx.after.payable) + ', ' + B.rs(fx.after.pay) + ' (' + B.signedRs(fx.diff) + ')' + (k.status === 'pending' ? ' · does not count until approved' : '') + '</div>' +
          '<div class="stamps">' + B.stamp('Entered by', k.enteredBy, k.enteredAt) + (k.status === 'pending' ? B.stamp('Approved by', null) : B.stamp(k.status === 'approved' ? 'Approved by' : 'Not approved by', k.approvedBy, k.approvedAt)) + '</div></div>';
      });
      h += '</div>';
    }
    var tasks = st.tasks.filter(function (t) { return t.crew === w.crew; });
    h += '<div class="card"><h2>My crew and task</h2><div class="small muted">' + esc(c.name + ' · ' + c.trade) + ' · ' + st.workers.filter(function (x) { return x.crew === c.id; }).map(function (x) { return esc(x.name); }).join(', ') + '</div>' +
      tasks.map(function (t) { return '<div class="change"><b>' + esc(t.task) + ' · ' + esc(t.location) + '</b><div class="small">' + B.num(t.done) + ' of ' + B.num(t.assigned) + ' ' + esc(t.unit) + ' done</div><div class="stamps">' + B.stamp('Verified by', t.verifiedBy, t.verifiedAt) + '</div></div>'; }).join('') + '</div>';
    var rain = st.rain.filter(function (r) { return r.site === w.site; });
    h += '<div class="card"><h2>Rain stoppage</h2>' + (rain.length ? rain.map(function (r) {
      var mine = r.crews.indexOf(c.name) >= 0 || r.crews === 'All crews';
      return '<p style="margin:4px 0"><b>' + B.fmtTime(r.from) + '–' + B.fmtTime(r.to) + '</b> · ' + esc(r.crews) + ' moved to ' + esc(r.movedTo) + '.' + (mine ? ' Your crew was moved.' : '') + '</p><p class="small" style="margin:0">' + esc(r.hoursNote) + '</p>';
    }).join('') : '<p class="small muted">No rain stoppage today.</p>') + '</div>';
    return h + CORR_NOTE;
  }
  function myWeek() {
    var w = B.worker(me), total = 0, mins = 0;
    var rows = B.WEEK.map(function (d) {
      var e = myEntry(d);
      if (!e) return '<div class="item row"><span>' + B.DAYNAME[d] + '</span><span class="muted">No entry</span></div>';
      if (e.status === 'absent') return '<div class="item row"><span>' + B.DAYNAME[d] + '</span><span class="muted">Absent</span></div>';
      var p = B.payOf(e);
      if (!p.ok) return '<div class="item row"><span>' + B.DAYNAME[d] + '</span><span class="fix">Needs a fix</span></div>';
      total += p.pay; mins += p.payable;
      var corr = B.entryCorrections(e.id).some(function (k) { return k.status === 'approved'; });
      return '<div class="item row" data-day="' + d + '"><span>' + B.DAYNAME[d] + (d === B.DEMO_DAY ? ' <span class="badge accent">Today</span>' : '') + (corr ? ' <span class="badge">Corrected</span>' : '') + '</span><span style="text-align:right"><b>' + B.fmtHM(p.payable) + '</b> · ' + B.rs(p.pay) + '</span></div>';
    }).join('');
    return '<div class="sub"><span><b>' + esc(w.name) + '</b> · ' + B.rs(w.rate) + '/hour (sample)</span><span>Week of 12–17 Oct 2026</span></div>' +
      '<div class="card"><div class="row"><div><div class="small muted">Week total</div><div class="big" data-weektotal>' + B.rs(total) + '</div></div><div style="text-align:right"><div class="small muted">Payable time</div><div class="big">' + B.fmtHM(mins) + '</div></div></div></div>' +
      '<div class="list">' + rows + '</div><p class="caption">Each day is worked out from exact minutes, then rounded to the rupee. Pending corrections are not counted until approved. Sample figures, not company policy.</p>' + CORR_NOTE;
  }

  /* ---------------- Engineer ---------------- */
  function siteOfEntry(e) { var w = B.worker(e.worker); return w && w.site; }
  function queue() {
    var st = B.get();
    var pend = st.corrections.filter(function (k) { if (k.status !== 'pending') return false; var e = st.entries.find(function (x) { return x.id === k.entry; }); return e && siteOfEntry(e) === esite; });
    var unver = st.entries.filter(function (e) { return !e.verifiedBy && siteOfEntry(e) === esite; });
    var tasks = st.tasks.filter(function (t) { return t.site === esite && !t.verifiedBy && t.reported !== false; });
    var canApprove = eng === 'Suresh K';
    var h = '<div class="sub"><span><b>Checks queue</b> · ' + esc(B.SITES[esite].name) + '</span><span>' + (pend.length + unver.length + tasks.length) + ' waiting</span></div>';

    h += '<div class="sec-h"><h2>Hour corrections (' + pend.length + ')</h2></div>';
    if (!canApprove && pend.length) h += '<p class="caption">In this demo, hour corrections are approved by the site engineer, Suresh K. Switch "Acting as" to approve.</p>';
    h += pend.map(function (k) {
      var fx = B.correctionEffect(k), w = B.worker(fx.entry.worker);
      return '<div class="card" data-corr="' + k.id + '"><div class="row"><h3>' + esc(w.name) + '</h3><span class="badge accent">Waiting</span></div>' +
        '<div class="change"><div><b>' + esc(B.describeChanges(k)) + '</b></div><div class="small">Reason: ' + esc(k.reason) + '</div>' +
        '<div class="small">Pay effect: <span class="effect">' + B.fmtHM(fx.before.payable) + ' ' + B.rs(fx.before.pay) + ' → ' + B.fmtHM(fx.after.payable) + ' ' + B.rs(fx.after.pay) + ' (' + B.signedRs(fx.diff) + ')</span></div>' +
        '<div class="small muted">Original entry: in ' + B.fmtTime(fx.entry.in) + ', out ' + B.fmtTime(fx.entry.out) + ', break ' + fx.entry.breakMin + ' min. It stays visible after approval.</div></div>' +
        '<div class="stamps">' + B.stamp('Entered by', k.enteredBy, k.enteredAt) + '</div>' +
        '<div class="actions"><button type="button" class="btn" data-action="reject" data-id="' + k.id + '"' + (canApprove ? '' : ' disabled') + '>Not approved</button><button type="button" class="btn primary" data-action="approve" data-id="' + k.id + '"' + (canApprove ? '' : ' disabled') + '>Approve as ' + esc(eng) + '</button></div></div>';
    }).join('') || '<div class="list"><div class="empty">No corrections waiting.</div></div>';

    if (unver.length) {
      h += '<div class="sec-h"><h2>Day entries to verify (' + unver.length + ')</h2></div>';
      h += unver.map(function (e) {
        var w = B.worker(e.worker), p = B.payOf(e);
        return '<div class="card" data-ventry="' + e.id + '"><div class="row"><h3>' + esc(w.name) + '</h3><span class="badge">' + (e.status === 'absent' ? 'Absent' : p.ok ? B.fmtHM(p.payable) + ' · ' + B.rs(p.pay) : 'Needs a fix') + '</span></div>' +
          (e.status === 'absent' ? '' : '<div class="small">In ' + B.fmtTime(e.in) + ' · Out ' + B.fmtTime(e.out) + ' · Break ' + esc(e.breakMin) + ' min</div>') + (p.ok ? '' : '<p class="small fix">' + esc(p.error) + '. Ask the office to enter a correction.</p>') +
          '<div class="stamps">' + B.stamp('Entered by', e.enteredBy, e.enteredAt) + '</div><div class="actions"><button type="button" class="btn primary" data-action="verify-entry" data-id="' + e.id + '"' + (p.ok ? '' : ' disabled') + '>Verify as ' + esc(eng) + '</button></div></div>';
      }).join('');
    }

    h += '<div class="sec-h"><h2>Crew quantities to verify (' + tasks.length + ')</h2></div>';
    h += tasks.map(function (t) {
      var over = t.done > t.assigned;
      return '<div class="card" data-vtask="' + t.id + '"><div class="row"><h3>' + esc(B.crew(t.crew).name) + ' · ' + esc(t.task) + '</h3>' + (over ? '<span class="badge">Over target</span>' : '') + '</div><div class="small muted">' + esc(t.location) + '</div>' +
        '<div class="facts"><div><span>Assigned</span><b>' + B.num(t.assigned) + ' ' + esc(t.unit) + '</b></div><div><span>Reported</span><b>' + B.num(t.done) + ' ' + esc(t.unit) + '</b></div><div><span>Entered by</span><b>' + esc(t.enteredBy) + '</b></div></div>' +
        (t.note ? '<div class="small muted">' + esc(t.note) + '</div>' : '') +
        '<label class="field" style="margin-top:8px"><span>Quantity you checked on site (' + esc(t.unit) + ')</span><input name="vq-' + t.id + '" inputmode="decimal" value="' + esc(t.done) + '"></label>' +
        '<div class="actions"><button type="button" class="btn primary" data-action="verify-task" data-id="' + t.id + '">Verify as ' + esc(eng) + '</button></div></div>';
    }).join('') || '<div class="list"><div class="empty">All crew quantities verified.</div></div>';

    var sum = B.materialSummary(esite);
    h += '<div class="sec-h"><h2>Record a material count</h2></div><div class="card"><div class="two">' +
      '<label class="field"><span>Material</span>' + B.select('cmat', sum.map(function (r) { return [r.key, B.MATERIALS[r.key].name]; }), 'cement') + '</label>' +
      '<label class="field"><span>Counted quantity</span><input name="cqty" inputmode="decimal" placeholder="e.g. 125"></label></div>' +
      '<p class="small muted" id="bookbal" style="margin:0 0 6px"></p><p class="err" id="cerr"></p>' +
      '<button type="button" class="btn primary block" data-action="count">Record count as ' + esc(eng) + '</button>' +
      '<ul class="hist" style="margin-top:10px">' + sum.map(function (r) { var c = r.lastCount, u = B.MATERIALS[r.key].unit; return '<li class="' + (r.countDiff ? 'pend' : 'ok') + '"><b>' + esc(B.MATERIALS[r.key].name) + '</b>: book ' + B.num(r.balance) + ' ' + u + (c ? ' · counted ' + B.num(c.qty) + ' ' + u + ' by ' + esc(c.by) + ', ' + B.fmtStamp(c.at) : ' · not counted') + (r.countDiff ? ' · differs by ' + B.num(Math.abs(r.countDiff)) + ', recount' : '') + '</li>'; }).join('') + '</ul></div>';

    var done = st.corrections.filter(function (k) { return k.status !== 'pending' && k.approvedBy; }).map(function (k) { var e = st.entries.find(function (x) { return x.id === k.entry; }); return { at: k.approvedAt, site: siteOfEntry(e), text: (k.status === 'approved' ? 'Approved' : 'Not approved') + ' correction for ' + B.worker(e.worker).name + ' (' + B.describeChanges(k) + ')', by: k.approvedBy }; })
      .concat(st.tasks.filter(function (t) { return t.verifiedBy; }).map(function (t) { return { at: t.verifiedAt, site: t.site, text: 'Verified ' + B.crew(t.crew).name + ' ' + t.task + ': ' + B.num(t.done) + ' ' + t.unit, by: t.verifiedBy }; }))
      .filter(function (x) { return x.site === esite; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; }).slice(0, 8);
    h += '<div class="sec-h"><h2>Recently approved / verified</h2></div><div class="list">' + done.map(function (x) { return '<div class="item small">' + esc(x.text) + '<div class="stamps"><span class="stamp ok">By <b>' + esc(x.by) + '</b> · ' + B.fmtStamp(x.at) + '</span></div></div>'; }).join('') + '</div>';
    return h;
  }
  function bookHint() {
    var sel = main.querySelector('[name=cmat]'), p = document.getElementById('bookbal'); if (!sel || !p) return;
    var r = B.materialSummary(esite).find(function (x) { return x.key === sel.value; });
    p.textContent = 'Book balance: ' + B.num(r.balance) + ' ' + B.MATERIALS[r.key].unit + '. A difference starts a recount and a check, not an accusation.';
  }

  /* ---------------- events ---------------- */
  document.addEventListener('change', function (ev) {
    var n = ev.target.name;
    if (n === 'me') { me = B.ui('sWorker', ev.target.value); render(); }
    else if (n === 'eng') { eng = B.ui('sEng', ev.target.value); render(); }
    else if (n === 'esite') { esite = B.ui('sSite', ev.target.value); render(); }
    else if (n === 'cmat') bookHint();
  });
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('button'); if (!t) return;
    if (t.dataset.view) { view = B.ui('sView', t.dataset.view); render(); window.scrollTo(0, 0); return; }
    if (t.dataset.ltab) { ltab = B.ui('sLTab', t.dataset.ltab); render(); return; }
    var a = t.dataset.action, st = B.get();
    if (a === 'approve' || a === 'reject') {
      if (eng !== 'Suresh K') return;
      var k = st.corrections.find(function (x) { return x.id === t.dataset.id; });
      k.status = a === 'approve' ? 'approved' : 'rejected'; k.approvedBy = eng; k.approvedAt = B.nowStamp();
      var w = B.worker(st.entries.find(function (x) { return x.id === k.entry; }).worker);
      B.log((a === 'approve' ? 'Correction approved' : 'Correction not approved') + ' for ' + w.name + ' by ' + eng);
      B.save(); render(); B.toast((a === 'approve' ? 'Approved' : 'Marked not approved') + ' · ' + eng + ' · ' + B.fmtStamp(k.approvedAt));
    } else if (a === 'verify-entry') {
      var e = st.entries.find(function (x) { return x.id === t.dataset.id; });
      e.verifiedBy = eng; e.verifiedAt = B.nowStamp(); B.log('Day entry for ' + B.worker(e.worker).name + ' verified by ' + eng); B.save(); render(); B.toast('Verified by ' + eng);
    } else if (a === 'verify-task') {
      var tk = st.tasks.find(function (x) { return x.id === t.dataset.id; });
      var q = Number(main.querySelector('[name="vq-' + tk.id + '"]').value);
      if (!Number.isFinite(q) || q < 0) { B.toast('Enter the checked quantity'); return; }
      if (q !== tk.done) { tk.note = (tk.note ? tk.note + ' ' : '') + 'Engineer check: ' + B.num(q) + ' ' + tk.unit + ' (reported ' + B.num(tk.done) + ').'; tk.done = q; }
      tk.verifiedBy = eng; tk.verifiedAt = B.nowStamp(); B.log(B.crew(tk.crew).name + ' quantity verified by ' + eng); B.save(); render(); B.toast('Quantity verified by ' + eng);
    } else if (a === 'count') {
      var mat = main.querySelector('[name=cmat]').value, cq = Number(main.querySelector('[name=cqty]').value), raw = main.querySelector('[name=cqty]').value.trim();
      if (!raw || !Number.isFinite(cq) || cq < 0) { document.getElementById('cerr').textContent = 'Enter the counted quantity (zero or more).'; return; }
      st.counts.push({ id: B.uid('q'), site: esite, material: mat, qty: cq, by: eng, at: B.nowStamp() });
      B.log('Material count: ' + B.MATERIALS[mat].name + ' ' + B.num(cq) + ' by ' + eng); B.save(); render(); B.toast('Count recorded by ' + eng);
    }
  });
  B.bindReset(render);
  render();
})();
