/* Management app (owners & office). Demo only, sample data. */
(function () {
  'use strict';
  var B = window.BNB, esc = B.esc;
  B.load();
  var TABS = [['today', 'Today'], ['labour', 'Labour'], ['work', 'Work'], ['materials', 'Materials']];
  var site = B.ui('mSite') || 'A', tab = B.ui('mTab') || 'today';
  var main = document.getElementById('main');

  function header() {
    document.getElementById('siteSeg').innerHTML = Object.keys(B.SITES).map(function (k) {
      return '<button type="button" data-site="' + k + '" aria-pressed="' + (k === site) + '">' + esc(B.SITES[k].short) + '</button>';
    }).join('');
    document.getElementById('tabs').innerHTML = TABS.map(function (t) {
      return '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === tab) + '">' + t[1] + '</button>';
    }).join('');
  }
  function subline() {
    return '<div class="sub"><span><b>' + esc(B.SITES[site].name) + '</b> · ' + esc(B.SITES[site].detail) + '</span><span>Demo day: Sat 17 Oct 2026</span></div>';
  }
  function render() {
    header();
    var html = subline();
    if (tab === 'today') html += today();
    else if (tab === 'labour') html += labour();
    else if (tab === 'work') html += work();
    else html += materials();
    main.innerHTML = html;
    document.getElementById('foot').innerHTML = B.demoFooter();
  }

  /* ---------------- Today ---------------- */
  function today() {
    var s = B.snapshotCache = B.siteSnapshot(site), st = B.get();
    var present = B.siteEntries(site).filter(function (e) { return e.status !== 'absent'; }).map(function (e) { return B.worker(e.worker).name; });
    var absent = B.siteEntries(site).filter(function (e) { return e.status === 'absent'; }).map(function (e) { return B.worker(e.worker).name; });
    function stat(k, v, d, attn, go) { return '<button type="button" class="stat' + (attn ? ' attn' : '') + '" data-go="' + go + '" style="text-align:left;cursor:pointer;font:inherit"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="d">' + d + '</div></button>'; }
    var h = '<div class="grid2">' +
      stat('Workers present', s.present, esc(present.join(', ') || 'None'), false, 'labour') +
      stat('Absent', s.absent, esc(absent.join(', ') || 'None'), false, 'labour') +
      stat('Total payable hours', B.fmtHM(s.mins), 'Labour pay today ' + B.rs(s.pay) + (s.fix ? ' · <span class="fix">' + s.fix + ' need a fix</span>' : ''), s.fix > 0, 'labour') +
      stat('Crew tasks verified', s.verified + ' of ' + s.tasks, s.verified < s.tasks ? 'Waiting for engineer check' : 'All verified', s.verified < s.tasks, 'work') +
      stat('Open material flags', s.flags, s.flags ? 'Checks to do, not accusations' : 'Nothing open', s.flags > 0, 'materials') +
      stat('Corrections waiting', s.pending, s.pending ? 'Need engineer approval' : 'None waiting', s.pending > 0, 'labour') +
      '</div>';
    if (s.unverifiedEntries) h += '<p class="caption">' + s.unverifiedEntries + ' day entr' + (s.unverifiedEntries > 1 ? 'ies' : 'y') + ' still waiting for an engineer to verify.</p>';
    var rain = st.rain.filter(function (r) { return r.site === site; });
    var blk = st.blockers.filter(function (b) { return b.site === site; });
    h += '<div class="sec-h"><h2>On site today</h2></div>';
    h += '<div class="list">' +
      rain.map(function (r) { return '<div class="item"><b>Rain stoppage ' + B.fmtTime(r.from) + '–' + B.fmtTime(r.to) + '</b><div class="small muted">' + esc(r.crews) + ' moved to ' + esc(r.movedTo) + '. ' + esc(r.hoursNote) + '</div></div>'; }).join('') +
      blk.map(function (b) { return '<div class="item"><b>Blocker</b><div class="small muted">' + esc(b.text) + '</div></div>'; }).join('') +
      (rain.length + blk.length ? '' : '<div class="empty">No blockers or stoppages recorded.</div>') + '</div>';
    var lg = st.log.slice(0, 6);
    if (lg.length) h += '<div class="sec-h"><h2>Demo changes on this device</h2></div><div class="list">' + lg.map(function (l) { return '<div class="item small">' + esc(l.text) + ' <span class="muted">· ' + B.fmtStamp(l.at) + '</span></div>'; }).join('') + '</div>';
    return h;
  }

  /* ---------------- Labour ---------------- */
  function entryCard(e) {
    var w = B.worker(e.worker), c = B.crew(w.crew), cs = B.entryCorrections(e.id), eff = B.effective(e), p = B.payOf(e);
    var pending = cs.filter(function (k) { return k.status === 'pending'; })[0];
    var approved = cs.filter(function (k) { return k.status === 'approved'; });
    var badges = '';
    if (e.status === 'absent') badges += '<span class="badge solid">Absent</span>';
    else if (!p.ok) badges += '<span class="badge accent">⚠ Needs a fix</span>';
    if (approved.length) badges += ' <span class="badge">Corrected</span>';
    if (pending) badges += ' <span class="badge accent">Correction pending</span>';
    var h = '<div class="card" id="entry-' + e.id + '" data-entry="' + e.id + '"><div class="row"><div><h3>' + esc(w.name) + '</h3><div class="small muted">' + esc(c ? c.name + ' · ' + c.trade : '') + ' · ' + B.rs(w.rate) + '/hour</div></div><div class="pill-row">' + badges + '</div></div>';
    if (e.status === 'absent') {
      h += '<p class="small">' + esc(e.note || 'Absent') + '</p>';
    } else {
      h += '<div class="facts"><div><span>Arrival</span><b>' + B.fmtTime(eff.in) + '</b></div><div><span>Departure</span><b>' + B.fmtTime(eff.out) + '</b></div><div><span>Break</span><b>' + esc(eff.breakMin) + ' min</b></div>' +
        '<div><span>Rate</span><b>' + B.rs(w.rate) + '/h</b></div><div><span>Payable</span><b>' + (p.ok ? B.fmtHM(p.payable) : '<span class="fix">—</span>') + '</b></div><div><span>Today\'s pay</span><b>' + (p.ok ? B.rs(p.pay) : '<span class="fix">Fix</span>') + '</b></div></div>';
      if (!p.ok) h += '<p class="small fix">Needs a fix: ' + esc(p.error) + '. No pay is counted until it is corrected.</p>';
      if (approved.length) { var op = B.payOf(e, { in: e.in, out: e.out, breakMin: e.breakMin }); h += '<p class="small muted" style="margin:6px 0 0" data-original>Original entry: in ' + B.fmtTime(e.in) + ', out ' + B.fmtTime(e.out) + ', break ' + e.breakMin + ' min' + (op.ok ? ' → ' + B.fmtHM(op.payable) + ', ' + B.rs(op.pay) : '') + '. Approved correction applied; see history.</p>'; }
      if (e.note) h += '<p class="small muted" style="margin:6px 0 0">' + esc(e.note) + '</p>';
    }
    if (pending) {
      var fx = B.correctionEffect(pending);
      h += '<div class="change"><b>Correction waiting for engineer approval</b><div>' + esc(B.describeChanges(pending)) + '</div><div class="small">Reason: ' + esc(pending.reason) + '</div>' +
        '<div class="small">Pay effect if approved: <span class="effect">' + (fx.diff === null ? 'needs a fix' : B.fmtHM(fx.before.payable) + ' ' + B.rs(fx.before.pay) + ' → ' + B.fmtHM(fx.after.payable) + ' ' + B.rs(fx.after.pay) + ' (' + B.signedRs(fx.diff) + ')') + '</span></div>' +
        '<div class="small muted">Does not count until approved. Approve in the Site app → Engineer view.</div></div>';
    }
    h += '<div class="stamps">' + B.stamp('Entered by', e.enteredBy, e.enteredAt) + B.stamp('Verified by', e.verifiedBy, e.verifiedAt) + '</div>';
    h += '<details data-hist="' + e.id + '"' + (openHist[e.id] ? ' open' : '') + '><summary>Edit history (' + (cs.length + 1) + ')</summary><ul class="hist">' + historyItems(e, cs) + '</ul></details>';
    if (e.status !== 'absent') h += '<div class="actions"><button type="button" class="btn small" data-action="correct" data-id="' + e.id + '"' + (pending ? ' disabled title="One correction is already waiting"' : '') + '>Enter correction</button></div>';
    return h + '</div>';
  }
  function historyItems(e, cs) {
    var w = B.worker(e.worker);
    var o = e.status === 'absent' ? 'Marked absent' : 'In ' + B.fmtTime(e.in) + ' · Out ' + B.fmtTime(e.out) + ' · Break ' + e.breakMin + ' min';
    var op = B.payOf(e, { in: e.in, out: e.out, breakMin: e.breakMin });
    var h = '<li class="orig"><b>Original entry</b> — ' + esc(o) + (e.status !== 'absent' ? ' → ' + (op.ok ? B.fmtHM(op.payable) + ', ' + B.rs(op.pay) : 'needs a fix') : '') +
      '<div class="tiny muted">Entered by ' + esc(e.enteredBy) + ' · ' + B.fmtStamp(e.enteredAt) + (e.verifiedBy ? ' · verified by ' + esc(e.verifiedBy) + ' · ' + B.fmtStamp(e.verifiedAt) : ' · not yet verified') + '</div></li>';
    cs.forEach(function (c) {
      var fx = B.correctionEffect(c);
      var st = c.status === 'approved' ? 'Approved by ' + c.approvedBy + ' · ' + B.fmtStamp(c.approvedAt) : c.status === 'rejected' ? 'Not approved by ' + c.approvedBy + ' · ' + B.fmtStamp(c.approvedAt) + ' (does not count)' : 'Waiting for approval (does not count yet)';
      h += '<li class="' + (c.status === 'approved' ? 'ok' : 'pend') + '"><b>Correction</b> — ' + esc(B.describeChanges(c)) +
        '<div class="small">Reason: ' + esc(c.reason) + '</div>' +
        '<div class="small">Pay effect: ' + (fx.diff === null ? 'needs a fix' : B.rs(fx.before.pay) + ' → ' + B.rs(fx.after.pay) + ' (' + B.signedRs(fx.diff) + ', ' + (fx.minDiff >= 0 ? '+' : '−') + Math.abs(fx.minDiff) + ' min)') + '</div>' +
        '<div class="tiny muted">Entered by ' + esc(c.enteredBy) + ' · ' + B.fmtStamp(c.enteredAt) + ' · ' + esc(st) + '</div></li>';
    });
    return h;
  }
  var openHist = {};
  function labour() {
    var es = B.siteEntries(site), s = B.siteSnapshot(site);
    var h = '<div class="row" style="align-items:center;margin-bottom:10px"><div><div class="big">' + B.fmtHM(s.mins) + ' · ' + B.rs(s.pay) + '</div><div class="small muted">Today, ' + s.present + ' present, ' + s.absent + ' absent · approved figures only</div></div>' +
      '<button type="button" class="btn primary" data-action="add-entry">+ Day entry</button></div>';
    h += es.map(entryCard).join('') || '<div class="empty">No entries yet.</div>';
    h += '<p class="caption">Pay = round((minutes from arrival to departure − unpaid break minutes) ÷ 60 × hourly rate), worked from exact minutes. The break length and pay rules shown are sample assumptions, not company policy.</p>';
    return h;
  }

  function addEntry() {
    var ws = B.get().workers.filter(function (w) { return w.site === site; });
    var have = B.siteEntries(site).map(function (e) { return e.worker; });
    var opts = ws.filter(function (w) { return have.indexOf(w.id) < 0; }).map(function (w) { return [w.id, w.name + ' (Rs ' + w.rate + '/h)']; });
    opts.push(['__new', 'New worker (sample name)…']);
    var crews = B.get().crews.filter(function (c) { return c.site === site; }).map(function (c) { return [c.id, c.name + ' · ' + c.trade]; });
    B.sheet({
      title: 'Add day entry · ' + B.SITES[site].short, submit: 'Save entry',
      body: B.field('Worker', B.select('worker', opts, opts[0][0])) +
        '<div data-new hidden><div class="two">' + B.field('Name', '<input name="name" autocomplete="off" placeholder="e.g. Basavaraj T">') + B.field('Hourly rate (Rs)', '<input name="rate" inputmode="numeric" value="90">') + '</div>' + B.field('Crew', B.select('crew', crews, crews[0][0])) + '</div>' +
        B.field('Attendance', B.select('status', [['present', 'Present'], ['absent', 'Absent']], 'present')) +
        '<div data-times><div class="two">' + B.field('Arrival', '<input type="time" name="in" value="08:00">') + B.field('Departure', '<input type="time" name="out" value="17:30">') + '</div>' +
        B.field('Unpaid break (minutes)', '<input name="breakMin" inputmode="numeric" value="30">', 'Zero or more, never longer than the time on site.') + '</div>' +
        B.field('Note (optional)', '<input name="note" placeholder="e.g. left early, reason">') +
        B.field('Entered by', B.select('enteredBy', B.personOptions(['mahesh']), 'Mahesh')),
      onInput: function (f, prev) {
        var isNew = f.worker.value === '__new'; f.querySelector('[data-new]').hidden = !isNew;
        var abs = f.status.value === 'absent'; f.querySelector('[data-times]').hidden = abs;
        if (abs) { prev.innerHTML = 'Marked absent · no pay for the day.'; return; }
        var rate = isNew ? f.rate.value : B.worker(f.worker.value).rate;
        var r = B.computePay(f.in.value, f.out.value, f.breakMin.value.trim() === '' ? '' : Number(f.breakMin.value), rate === '' ? '' : Number(rate));
        prev.innerHTML = r.ok ? 'Payable <b>' + B.fmtHM(r.payable) + '</b> · Today\'s pay <b>' + B.rs(r.pay) + '</b>' : '<span class="fix">Needs a fix: ' + esc(r.error) + '.</span> It will be saved but counts no pay until fixed.';
      },
      onSubmit: function (f) {
        var wid = f.worker.value;
        if (wid === '__new') {
          var nm = f.name.value.trim(), rt = Number(f.rate.value);
          if (!nm) return 'Enter the worker\'s name.';
          if (!Number.isFinite(rt) || rt <= 0) return 'Enter an hourly rate above zero.';
          wid = B.uid('w'); B.get().workers.push({ id: wid, site: site, crew: f.crew.value, name: nm, rate: rt, added: true });
        }
        var abs = f.status.value === 'absent';
        var br = f.breakMin.value.trim() === '' ? '' : Number(f.breakMin.value);
        var e = { id: B.uid('e'), worker: wid, date: B.DEMO_DAY, status: abs ? 'absent' : 'present', in: abs ? '' : f.in.value, out: abs ? '' : f.out.value, breakMin: abs ? 0 : br,
          note: f.note.value.trim(), enteredBy: f.enteredBy.value, enteredAt: B.nowStamp(), verifiedBy: null, verifiedAt: null };
        B.get().entries.push(e);
        B.log('Day entry added for ' + B.worker(wid).name + ' by ' + e.enteredBy);
        B.save(); render(); B.toast('Entry saved · waiting for engineer to verify');
      }
    });
  }

  function correct(id) {
    var e = B.get().entries.find(function (x) { return x.id === id; }), w = B.worker(e.worker), cur = B.effective(e);
    B.sheet({
      title: 'Correction · ' + w.name, submit: 'Send for approval',
      body: '<p class="small muted" style="margin-top:0">Current: in ' + B.fmtTime(cur.in) + ', out ' + B.fmtTime(cur.out) + ', break ' + cur.breakMin + ' min. The original entry stays visible in the history.</p>' +
        '<div class="two">' + B.field('Arrival', '<input type="time" name="in" value="' + esc(cur.in) + '">') + B.field('Departure', '<input type="time" name="out" value="' + esc(cur.out) + '">') + '</div>' +
        B.field('Unpaid break (minutes)', '<input name="breakMin" inputmode="numeric" value="' + esc(cur.breakMin) + '">') +
        B.field('Reason', '<textarea name="reason" placeholder="e.g. Crew stayed back for the slab pour"></textarea>', 'Required. Shown to the approving engineer.') +
        B.field('Entered by', B.select('enteredBy', B.personOptions(['mahesh']), 'Mahesh')),
      onInput: function (f, prev) {
        var before = B.payOf(e, cur), after = B.payOf(e, { in: f.in.value, out: f.out.value, breakMin: f.breakMin.value.trim() === '' ? '' : Number(f.breakMin.value) });
        if (!after.ok) { prev.innerHTML = '<span class="fix">Corrected times need a fix: ' + esc(after.error) + '.</span>'; return; }
        prev.innerHTML = 'Pay effect before approval: <b>' + (before.ok ? B.fmtHM(before.payable) + ' ' + B.rs(before.pay) : 'needs fix') + ' → ' + B.fmtHM(after.payable) + ' ' + B.rs(after.pay) + '</b>' + (before.ok ? ' (<b>' + B.signedRs(after.pay - before.pay) + '</b>)' : '') + '<div class="tiny muted">Does not count until an engineer approves.</div>';
      },
      onSubmit: function (f) {
        var nb = f.breakMin.value.trim() === '' ? '' : Number(f.breakMin.value);
        var after = B.payOf(e, { in: f.in.value, out: f.out.value, breakMin: nb });
        if (!after.ok) return 'Fix the corrected times first: ' + after.error + '.';
        var ch = {};
        if (f.in.value !== cur.in) ch.in = f.in.value;
        if (f.out.value !== cur.out) ch.out = f.out.value;
        if (nb !== Number(cur.breakMin)) ch.breakMin = nb;
        if (!Object.keys(ch).length) return 'Nothing changed.';
        if (f.reason.value.trim().length < 4) return 'Enter a reason for the correction.';
        B.get().corrections.push({ id: B.uid('k'), entry: e.id, changes: ch, before: { in: cur.in, out: cur.out, breakMin: cur.breakMin }, reason: f.reason.value.trim(),
          enteredBy: f.enteredBy.value, enteredAt: B.nowStamp(), status: 'pending', approvedBy: null, approvedAt: null });
        B.log('Correction for ' + w.name + ' entered by ' + f.enteredBy.value + ' (pending)');
        B.save(); render(); B.toast('Correction sent · waiting for engineer approval');
      }
    });
  }

  /* ---------------- Work ---------------- */
  function work() {
    var st = B.get(), h = '<div class="note">Low output can mean rain or missing material, not dishonesty. A gap triggers a look at what happened; it never cuts a worker\'s hours by itself.</div>';
    h += '<div class="sec-h"><h2>Crew tasks</h2><button type="button" class="btn small primary" data-action="assign">+ Assign task</button></div>';
    st.crews.filter(function (c) { return c.site === site; }).forEach(function (c) {
      var members = st.workers.filter(function (w) { return w.crew === c.id; }).map(function (w) {
        var e = B.siteEntries(site).find(function (x) { return x.worker === w.id; }); return esc(w.name) + (e && e.status === 'absent' ? ' (absent)' : '');
      });
      h += '<div class="card"><div class="row"><h3>' + esc(c.name) + ' · ' + esc(c.trade) + '</h3></div><div class="small muted">' + members.join(', ') + '</div>';
      st.tasks.filter(function (t) { return t.crew === c.id; }).forEach(function (t) { h += taskBlock(t); });
      h += '</div>';
    });
    h += '<div class="sec-h"><h2>Blockers</h2><button type="button" class="btn small" data-action="blocker">+ Blocker</button></div><div class="list">';
    var bl = st.blockers.filter(function (b) { return b.site === site; });
    h += bl.map(function (b) { return '<div class="item"><div>' + esc(b.text) + '</div><div class="stamps">' + B.stamp('Recorded by', b.recordedBy, b.at) + B.stamp('Entered by', b.enteredBy, b.at) + '</div></div>'; }).join('') || '<div class="empty">No blockers recorded.</div>';
    h += '</div>';
    h += '<div class="sec-h"><h2>Midday spot-check</h2><button type="button" class="btn small" data-action="spot">+ Spot-check</button></div><div class="list">';
    var sp = st.spot.filter(function (x) { return x.site === site; });
    h += sp.map(function (x) {
      return '<div class="item"><div class="row"><b>' + B.fmtTime(x.time) + ' headcount: ' + x.counted + '</b><span class="badge">' + (x.counted === x.register ? 'Matches register (' + x.register + ')' : 'Register says ' + x.register + ' · look into it') + '</span></div>' +
        '<div class="small muted">' + esc(x.note) + ' Random check done by someone other than the attendance writer.</div><div class="stamps">' + B.stamp('Counted by', x.by + ' (QA)', x.at) + '<span class="stamp">Attendance written by <b>' + esc(x.registerBy) + '</b></span></div></div>';
    }).join('') || '<div class="empty">No spot-check yet today.</div>';
    h += '</div>';
    h += '<div class="sec-h"><h2>Rain stoppage</h2><button type="button" class="btn small" data-action="rain">+ Stoppage</button></div><div class="list">';
    var rn = st.rain.filter(function (x) { return x.site === site; });
    h += rn.map(function (r) {
      return '<div class="item"><b>Work stopped ' + B.fmtTime(r.from) + '–' + B.fmtTime(r.to) + '</b><div class="small">' + esc(r.crews) + ' moved to ' + esc(r.movedTo) + '.</div><div class="small">' + esc(r.hoursNote) + '</div><div class="stamps">' + B.stamp('Recorded by', r.recordedBy, r.at) + B.stamp('Entered by', r.enteredBy, r.at) + '</div></div>';
    }).join('') || '<div class="empty">No rain stoppage recorded today.</div>';
    return h + '</div>';
  }
  function taskBlock(t) {
    var pct = Math.min(100, Math.round(t.done / t.assigned * 100)), over = t.done > t.assigned;
    return '<div class="change" data-task="' + t.id + '"><div class="row"><b>' + esc(t.task) + ' · ' + esc(t.location) + '</b>' + (over ? '<span class="badge">Over target</span>' : '') + '</div>' +
      '<div class="small">Assigned this morning: <b>' + B.num(t.assigned) + ' ' + esc(t.unit) + '</b> · Completed: <b>' + B.num(t.done) + ' ' + esc(t.unit) + '</b>' + (over ? ' (+' + B.num(t.done - t.assigned) + ' over the assigned quantity)' : '') + '</div>' +
      '<div class="progress"><i style="width:' + pct + '%"></i></div>' + (t.note ? '<div class="small muted">' + esc(t.note) + '</div>' : '') +
      '<div class="stamps">' + B.stamp('Assigned by', t.assignedBy, t.assignedAt) + B.stamp('Entered by', t.enteredBy, t.enteredAt) + (t.reported === false ? '<span class="stamp">Completed quantity not reported yet</span>' : B.stamp('Verified by', t.verifiedBy, t.verifiedAt)) + '</div>' +
      '<div class="actions"><button type="button" class="btn small" data-action="done-qty" data-id="' + t.id + '">Update completed</button></div></div>';
  }
  function assignTask() {
    var crews = B.get().crews.filter(function (c) { return c.site === site; }).map(function (c) { return [c.id, c.name + ' · ' + c.trade]; });
    B.sheet({
      title: 'Assign task · ' + B.SITES[site].short, submit: 'Assign',
      body: B.field('Crew', B.select('crew', crews, crews[0][0])) + B.field('Task', '<input name="task" placeholder="e.g. Shuttering">') + B.field('Location', '<input name="location" placeholder="e.g. Block B, 3rd floor">') +
        '<div class="two">' + B.field('Quantity assigned', '<input name="qty" inputmode="decimal" placeholder="e.g. 220">') + B.field('Unit', B.select('unit', ['sq m', 'blocks', 't', 'cu m', 'rmt', 'nos'], 'sq m')) + '</div>' +
        B.field('Assigned by', B.select('assignedBy', B.personOptions(['suresh', 'prakashr']), 'Suresh K')) + B.field('Entered by', B.select('enteredBy', B.personOptions(['mahesh']), 'Mahesh')),
      onSubmit: function (f) {
        var q = Number(f.qty.value);
        if (!f.task.value.trim() || !f.location.value.trim()) return 'Enter the task and location.';
        if (!Number.isFinite(q) || q <= 0) return 'Enter a quantity above zero.';
        B.get().tasks.push({ id: B.uid('t'), site: site, crew: f.crew.value, task: f.task.value.trim(), location: f.location.value.trim(), unit: f.unit.value, assigned: q, done: 0,
          assignedBy: f.assignedBy.value, assignedAt: B.nowStamp(), enteredBy: f.enteredBy.value, enteredAt: B.nowStamp(), verifiedBy: null, verifiedAt: null, note: '', reported: false });
        B.log('Task "' + f.task.value.trim() + '" assigned to ' + B.crew(f.crew.value).name); B.save(); render(); B.toast('Task assigned');
      }
    });
  }
  function doneQty(id) {
    var t = B.get().tasks.find(function (x) { return x.id === id; });
    B.sheet({
      title: 'Completed quantity · ' + t.task, submit: 'Save',
      body: '<p class="small muted" style="margin-top:0">' + esc(B.crew(t.crew).name + ' · ' + t.location) + ' · assigned ' + B.num(t.assigned) + ' ' + esc(t.unit) + '. Saving sends it to an engineer to verify again.</p>' +
        B.field('Completed (' + t.unit + ')', '<input name="done" inputmode="decimal" value="' + esc(t.done) + '">') + B.field('Note (optional)', '<input name="note" value="' + esc(t.note) + '">') + B.field('Entered by', B.select('enteredBy', B.personOptions(['mahesh']), 'Mahesh')),
      onSubmit: function (f) {
        var q = Number(f.done.value); if (!Number.isFinite(q) || q < 0) return 'Enter zero or more.';
        t.done = q; t.reported = true; t.note = f.note.value.trim(); t.enteredBy = f.enteredBy.value; t.enteredAt = B.nowStamp(); t.verifiedBy = null; t.verifiedAt = null;
        B.log('Completed quantity updated for ' + B.crew(t.crew).name + ' (' + t.task + ')'); B.save(); render(); B.toast('Saved · waiting for engineer to verify');
      }
    });
  }
  function simpleForm(kind) {
    if (kind === 'blocker') return B.sheet({ title: 'Record blocker', submit: 'Save',
      body: B.field('What happened', '<textarea name="text" placeholder="e.g. Ready-mix arrived 2 hours late, supplier delay"></textarea>') + B.field('Recorded by', B.select('by', B.personOptions(['suresh', 'prakashr']), 'Suresh K')) + B.field('Entered by', B.select('enteredBy', B.personOptions(['mahesh']), 'Mahesh')),
      onSubmit: function (f) { if (f.text.value.trim().length < 4) return 'Describe the blocker.'; B.get().blockers.push({ id: B.uid('b'), site: site, text: f.text.value.trim(), recordedBy: f.by.value, enteredBy: f.enteredBy.value, at: B.nowStamp() }); B.log('Blocker recorded'); B.save(); render(); B.toast('Blocker recorded'); } });
    if (kind === 'spot') return B.sheet({ title: 'Midday spot-check', submit: 'Save',
      body: '<div class="two">' + B.field('Time', '<input type="time" name="time" value="12:30">') + B.field('Headcount seen', '<input name="counted" inputmode="numeric">') + '</div>' + B.field('Counted by', B.select('by', [['Ramesh', 'Ramesh (QA)'], ['Prakash R', 'Prakash R (Engineer)'], ['Mahesh', 'Mahesh (Office)']], 'Ramesh'), 'Must be someone other than the attendance writer (Mahesh).') + B.field('Note', '<input name="note" placeholder="optional">'),
      onSubmit: function (f) {
        var n = Number(f.counted.value); if (!Number.isInteger(n) || n < 0) return 'Enter the headcount.';
        if (f.by.value === 'Mahesh') return 'The spot-check must be done by someone other than the attendance writer.';
        var reg = B.siteEntries(site).filter(function (e) { return e.status !== 'absent'; }).length;
        B.get().spot.push({ id: B.uid('s'), site: site, time: f.time.value, counted: n, register: reg, by: f.by.value, registerBy: 'Mahesh', note: f.note.value.trim() || (n === reg ? 'Matches register.' : 'Differs from register; check what happened.'), at: B.nowStamp() });
        B.log('Spot-check recorded by ' + f.by.value); B.save(); render(); B.toast('Spot-check saved');
      } });
    if (kind === 'rain') return B.sheet({ title: 'Rain stoppage', submit: 'Save',
      body: '<div class="two">' + B.field('Stopped at', '<input type="time" name="from" value="14:30">') + B.field('Resumed at', '<input type="time" name="to" value="15:15">') + '</div>' + B.field('Crews', '<input name="crews" placeholder="e.g. Crew 4">') + B.field('Moved to', '<input name="moved" value="Covered steel yard">') + B.field('Recorded by', B.select('by', B.personOptions(['suresh', 'prakashr']), 'Suresh K')),
      onSubmit: function (f) {
        var a = B.toMin(f.from.value), b = B.toMin(f.to.value); if (a === null || b === null || b <= a) return 'Enter a valid stop and resume time.';
        B.get().rain.push({ id: B.uid('r'), site: site, from: f.from.value, to: f.to.value, crews: f.crews.value.trim() || 'All crews', movedTo: f.moved.value.trim() || 'Covered area', hoursNote: 'Hours recorded as normal. Reason: rain stoppage.', recordedBy: f.by.value, enteredBy: 'Mahesh', at: B.nowStamp() });
        B.log('Rain stoppage recorded'); B.save(); render(); B.toast('Rain stoppage recorded');
      } });
  }

  /* ---------------- Materials ---------------- */
  var TYPE = { received: 'Delivery received', used: 'Used', returned: 'Returned', 'transfer-out': 'Moved to other site', 'transfer-in': 'Moved in from other site' };
  function materials() {
    var st = B.get(), h = '<div class="note">A mismatch starts a check, not an accusation.</div>';
    h += '<div class="grid2" style="margin-bottom:12px"><button type="button" class="btn primary" data-action="mv" data-type="received">+ Delivery</button><button type="button" class="btn" data-action="mv" data-type="used">Usage</button><button type="button" class="btn" data-action="mv" data-type="returned">Return</button><button type="button" class="btn" data-action="mv" data-type="transfer-out">Transfer to ' + (site === 'A' ? 'Site B' : 'Site A') + '</button></div>';
    st.mismatches.filter(function (m) { return m.site === site; }).forEach(function (m) {
      h += '<div class="card" id="mm-' + m.id + '"><div class="row"><h3>Delivery mismatch · ' + esc(m.item) + '</h3><span class="badge' + (m.status === 'open' ? ' accent' : '') + '">' + (m.status === 'open' ? 'Check open' : 'Checked') + '</span></div>' +
        '<div class="facts"><div><span>Billed</span><b>' + m.billed + ' ' + esc(m.unit) + '</b></div><div><span>Received</span><b>' + m.received + ' ' + esc(m.unit) + '</b></div><div><span>Gap</span><b>' + (m.billed - m.received) + ' ' + esc(m.unit) + '</b></div></div>' +
        '<p class="small" style="margin:6px 0">' + esc(m.detail) + '</p><p class="small" style="margin:6px 0"><b>Next step:</b> ' + esc(m.nextStep) + '</p>' +
        (m.checkNote ? '<p class="small muted">Check note: ' + esc(m.checkNote) + '</p>' : '') +
        '<div class="stamps">' + B.stamp('Noted by', m.notedBy, m.at) + B.stamp('Entered by', m.enteredBy, m.at) + B.stamp('Checked by', m.checkedBy, m.checkedAt) + '</div>' +
        (m.status === 'open' ? '<div class="actions"><button type="button" class="btn primary" data-action="mm-check" data-id="' + m.id + '">Mark checked</button></div>' : '') + '</div>';
    });
    B.materialSummary(site).forEach(function (r) {
      var M = B.MATERIALS[r.key], u = M.unit, c = r.lastCount;
      h += '<div class="card" data-mat="' + r.key + '"><div class="row"><h3>' + esc(M.name) + '</h3><span class="badge">Sample</span></div><table class="mat">' +
        '<tr><td>Received</td><td>' + B.num(r.received) + ' ' + u + '</td></tr>' + (r.moveIn ? '<tr><td>Moved in from other site</td><td>' + B.num(r.moveIn) + ' ' + u + '</td></tr>' : '') +
        '<tr><td>Used</td><td>' + B.num(r.used) + ' ' + u + '</td></tr><tr><td>Returned</td><td>' + B.num(r.returned) + ' ' + u + '</td></tr>' + (r.moveOut ? '<tr><td>Moved to other site</td><td>' + B.num(r.moveOut) + ' ' + u + '</td></tr>' : '') +
        '<tr class="bal"><td><b>Balance left</b></td><td data-balance>' + B.num(r.balance) + ' ' + u + '</td></tr></table>' +
        '<div class="stamps">' + (c ? B.stamp('Counted by', c.by, c.at) + '<span class="stamp">Count: <b>' + B.num(c.qty) + ' ' + u + '</b></span>' : '<span class="stamp wait">Not counted yet</span>') + '</div>' +
        (r.countDiff ? '<p class="small" style="margin:8px 0 0">Count is ' + B.num(Math.abs(r.countDiff)) + ' ' + u + (r.countDiff < 0 ? ' less' : ' more') + ' than the book balance. Next step: recount and check the usage log.</p>' : '') + '</div>';
    });
    var mv = st.moves.filter(function (m) { return m.site === site; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; }).slice(0, 10);
    h += '<div class="sec-h"><h2>Recent movements</h2></div><div class="list">' + mv.map(function (m) {
      return '<div class="item"><div class="row"><b>' + esc(TYPE[m.type]) + ' · ' + esc(B.MATERIALS[m.material].name) + '</b><b>' + B.num(m.qty) + ' ' + B.MATERIALS[m.material].unit + '</b></div><div class="small muted">' + esc(m.note) + '</div><div class="stamps">' + B.stamp('Entered by', m.enteredBy, m.at) + B.stamp('Counted by', m.countedBy, m.at) + '</div></div>';
    }).join('') + '</div>';
    return h;
  }
  function moveForm(type) {
    var other = site === 'A' ? 'B' : 'A', sum = {};
    B.materialSummary(site).forEach(function (r) { sum[r.key] = r.balance; });
    var mats = Object.keys(B.MATERIALS).map(function (k) { return [k, B.MATERIALS[k].name + ' (' + B.num(sum[k]) + ' ' + B.MATERIALS[k].unit + ' left)']; });
    var title = { received: 'Record delivery', used: 'Record usage', returned: 'Record return', 'transfer-out': 'Transfer to ' + B.SITES[other].short }[type];
    B.sheet({
      title: title + ' · ' + B.SITES[site].short, submit: 'Save',
      body: B.field('Material', B.select('material', mats, 'cement')) + B.field('Quantity', '<input name="qty" inputmode="decimal" placeholder="e.g. 50">') +
        B.field('Note', '<input name="note" placeholder="' + (type === 'received' ? 'e.g. lorry KA-01 sample, challan checked' : type === 'returned' ? 'e.g. returned to supplier / yard' : type === 'used' ? 'e.g. Block B columns' : 'e.g. for Tower 1 plaster') + '">') +
        B.field('Counted by', B.select('countedBy', B.personOptions(['prakashr', 'suresh']), 'Prakash R')) + B.field('Entered by', B.select('enteredBy', B.personOptions(['mahesh']), 'Mahesh')),
      onInput: function (f, prev) { var u = B.MATERIALS[f.material.value].unit; prev.innerHTML = 'Balance now: <b>' + B.num(sum[f.material.value]) + ' ' + u + '</b>' + (type === 'transfer-out' ? ' · will be added to ' + B.SITES[other].short : ''); },
      onSubmit: function (f) {
        var q = Number(f.qty.value), k = f.material.value;
        if (!Number.isFinite(q) || q <= 0) return 'Enter a quantity above zero.';
        if (type !== 'received' && q > sum[k] + 1e-9) return 'Only ' + B.num(sum[k]) + ' ' + B.MATERIALS[k].unit + ' left on this site.';
        var at = B.nowStamp(), note = f.note.value.trim();
        if (type === 'transfer-out') {
          B.get().moves.push({ id: B.uid('m'), site: site, material: k, type: 'transfer-out', qty: q, note: 'To ' + B.SITES[other].short + (note ? ': ' + note : ''), enteredBy: f.enteredBy.value, countedBy: f.countedBy.value, at: at });
          B.get().moves.push({ id: B.uid('m'), site: other, material: k, type: 'transfer-in', qty: q, note: 'From ' + B.SITES[site].short + (note ? ': ' + note : ''), enteredBy: f.enteredBy.value, countedBy: f.countedBy.value, at: at });
        } else B.get().moves.push({ id: B.uid('m'), site: site, material: k, type: type, qty: q, note: note || TYPE[type], enteredBy: f.enteredBy.value, countedBy: f.countedBy.value, at: at });
        B.log(TYPE[type] + ': ' + B.num(q) + ' ' + B.MATERIALS[k].unit + ' ' + B.MATERIALS[k].name + ' (' + B.SITES[site].short + ')');
        B.save(); render(); B.toast('Saved');
      }
    });
  }
  function checkMismatch(id) {
    var m = B.get().mismatches.find(function (x) { return x.id === id; });
    B.sheet({
      title: 'Mark mismatch checked', submit: 'Mark checked',
      body: '<p class="small" style="margin-top:0">' + esc(m.item) + ': billed ' + m.billed + ', received ' + m.received + ' ' + esc(m.unit) + '. ' + esc(m.nextStep) + '</p>' +
        B.field('Checked by', B.select('by', B.personOptions(['suresh', 'prakashr', 'mahesh']), 'Suresh K')) +
        B.field('What the check found', '<textarea name="note">Checked supplier invoice against gate log and pour register. Raised the 2 cu m difference with the supplier.</textarea>'),
      onSubmit: function (f) {
        m.status = 'checked'; m.checkedBy = f.by.value; m.checkedAt = B.nowStamp(); m.checkNote = f.note.value.trim();
        B.log('Ready-mix mismatch marked checked by ' + m.checkedBy); B.save(); render(); B.toast('Marked checked by ' + m.checkedBy);
      }
    });
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest('button,[data-go]'); if (!t) return;
    if (t.dataset.site) { site = B.ui('mSite', t.dataset.site); render(); return; }
    if (t.dataset.tab) { tab = B.ui('mTab', t.dataset.tab); render(); window.scrollTo(0, 0); return; }
    if (t.dataset.go) { tab = B.ui('mTab', t.dataset.go); render(); window.scrollTo(0, 0); return; }
    var a = t.dataset.action;
    if (a === 'add-entry') addEntry();
    else if (a === 'correct') correct(t.dataset.id);
    else if (a === 'assign') assignTask();
    else if (a === 'done-qty') doneQty(t.dataset.id);
    else if (a === 'blocker' || a === 'spot' || a === 'rain') simpleForm(a);
    else if (a === 'mv') moveForm(t.dataset.type);
    else if (a === 'mm-check') checkMismatch(t.dataset.id);
  });
  document.addEventListener('toggle', function (ev) { if (ev.target.dataset && ev.target.dataset.hist) openHist[ev.target.dataset.hist] = ev.target.open; }, true);
  B.bindReset(render);
  render();
})();
