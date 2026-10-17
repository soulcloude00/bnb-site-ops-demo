/* B&B Site Ops demo — shared store, seed data and UI helpers.
   ALL DATA IS DEMO SAMPLE DATA. Stored only in this browser's localStorage.
   No backend, no accounts, no sync. */
(function () {
  'use strict';
  var P = window.BNBPay;
  var KEY = 'bnb-site-ops-demo:data:v1';
  var UIKEY = 'bnb-site-ops-demo:ui:v1';
  var DEMO_DAY = '2026-10-17';
  var WEEK = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17'];
  var DAYNAME = { '2026-10-12': 'Mon 12 Oct', '2026-10-13': 'Tue 13 Oct', '2026-10-14': 'Wed 14 Oct', '2026-10-15': 'Thu 15 Oct', '2026-10-16': 'Fri 16 Oct', '2026-10-17': 'Sat 17 Oct' };

  var PEOPLE = {
    suresh: { name: 'Suresh K', role: 'Site engineer', does: 'approves hour corrections' },
    prakashr: { name: 'Prakash R', role: 'Engineer', does: 'verifies quantities' },
    ramesh: { name: 'Ramesh', role: 'QA', does: 'does spot checks' },
    mahesh: { name: 'Mahesh', role: 'Office', does: 'enters records' }
  };
  var SITES = {
    A: { id: 'A', short: 'Site A', name: 'Site A · Whitefield (sample)', detail: 'G+4 residential, Blocks A & B' },
    B: { id: 'B', short: 'Site B', name: 'Site B · Hebbal (sample)', detail: 'Twin-tower residential, foundation & plaster' }
  };
  var MATERIALS = {
    cement: { name: 'Cement (OPC 53, 50 kg bags)', unit: 'bags' },
    tmt: { name: 'TMT steel (Fe 550D)', unit: 't' },
    blocks: { name: 'Solid concrete blocks (6 in)', unit: 'nos' },
    msand: { name: 'M-sand', unit: 'cu m' }
  };

  function seed() {
    var workers = [
      { id: 'w1', site: 'A', crew: 'c1', name: 'Ravi Kumar', rate: 95 },
      { id: 'w2', site: 'A', crew: 'c1', name: 'Mohammed Irfan', rate: 100 },
      { id: 'w3', site: 'A', crew: 'c2', name: 'Prakash Gowda', rate: 95 },
      { id: 'w4', site: 'A', crew: 'c2', name: 'Anil Singh', rate: 90 },
      { id: 'w5', site: 'A', crew: 'c3', name: 'Sunil Yadav', rate: 90 },
      { id: 'w6', site: 'A', crew: 'c3', name: 'Deepak M', rate: 90 },
      { id: 'w7', site: 'B', crew: 'c4', name: 'Manjunath H', rate: 95 },
      { id: 'w8', site: 'B', crew: 'c4', name: 'Venkatesh R', rate: 90 },
      { id: 'w9', site: 'B', crew: 'c5', name: 'Arif Pasha', rate: 100 },
      { id: 'w10', site: 'B', crew: 'c5', name: 'Lakshmi N', rate: 90 }
    ];
    var crews = [
      { id: 'c1', site: 'A', name: 'Crew 1', trade: 'Shuttering' },
      { id: 'c2', site: 'A', name: 'Crew 2', trade: 'Blockwork' },
      { id: 'c3', site: 'A', name: 'Crew 3', trade: 'Steel fixing' },
      { id: 'c4', site: 'B', name: 'Crew 4', trade: 'Plastering' },
      { id: 'c5', site: 'B', name: 'Crew 5', trade: 'Foundation' }
    ];
    var D = DEMO_DAY;
    function e(id, w, date, inT, outT, br, extra) {
      return Object.assign({ id: id, worker: w, date: date, status: 'present', in: inT, out: outT, breakMin: br, note: '',
        enteredBy: 'Mahesh', enteredAt: date + 'T19:00', verifiedBy: 'Suresh K', verifiedAt: date + 'T19:20' }, extra || {});
    }
    var entries = [
      e('e1', 'w1', D, '08:02', '17:45', 30, { enteredAt: D + 'T17:50', verifiedAt: D + 'T18:00' }),
      e('e2', 'w2', D, '08:00', '18:05', 30, { enteredAt: D + 'T18:10', verifiedAt: D + 'T18:20' }),
      e('e3', 'w3', D, '08:05', '17:40', 30, { enteredAt: D + 'T17:45', verifiedAt: D + 'T18:00' }),
      e('e4', 'w4', D, '08:00', '17:30', 30, { enteredAt: D + 'T17:35', verifiedAt: D + 'T18:00' }),
      e('e5', 'w5', D, '08:00', '14:00', 30, { note: 'Left early at 2 PM: family function, told Suresh K in the morning.', enteredAt: D + 'T14:05', verifiedAt: D + 'T14:30' }),
      { id: 'e6', worker: 'w6', date: D, status: 'absent', in: '', out: '', breakMin: 0, note: 'Absent: phoned in at 7:30 AM.', enteredBy: 'Mahesh', enteredAt: D + 'T08:45', verifiedBy: 'Suresh K', verifiedAt: D + 'T09:00' },
      e('e7', 'w7', D, '08:15', '17:45', 30, { enteredAt: D + 'T17:50', verifiedAt: D + 'T18:05' }),
      e('e8', 'w8', D, '08:10', '17:40', 60, { enteredAt: D + 'T17:45', verifiedAt: D + 'T18:05' }),
      e('e9', 'w9', D, '08:00', '18:00', 30, { enteredAt: D + 'T18:05', verifiedAt: D + 'T18:15' }),
      e('e10', 'w10', D, '08:30', '17:00', 30, { enteredAt: D + 'T17:10', verifiedBy: null, verifiedAt: null })
    ];
    // Earlier days of the week (Mon-Fri), sample only
    var week = {
      w1: [['08:00', '17:30', 30], ['08:05', '17:45', 30], ['08:00', '16:10', 30], ['07:58', '17:40', 30], ['08:00', '17:50', 30]],
      w2: [['08:00', '17:45', 30], ['08:00', '18:00', 30], ['08:05', '16:15', 30], ['08:00', '17:40', 30], ['08:00', '17:55', 30]],
      w3: [['08:10', '17:30', 30], ['08:00', '17:35', 30], ['08:00', '16:05', 30], ['08:05', '17:30', 30], ['08:00', '17:40', 30]],
      w4: [['08:00', '17:15', 30], ['08:00', '17:30', 30], ['08:00', '16:00', 30], null, ['08:00', '17:30', 30]],
      w5: [['08:00', '17:30', 30], ['08:00', '17:20', 30], ['08:00', '16:00', 30], ['08:00', '17:30', 30], ['08:00', '17:25', 30]],
      w6: [['08:00', '17:30', 30], ['08:05', '17:30', 30], ['08:00', '16:00', 30], ['08:00', '17:15', 30], ['08:00', '17:30', 30]],
      w7: [['08:15', '17:45', 30], ['08:10', '17:40', 30], ['08:15', '17:30', 30], ['08:15', '17:45', 30], ['08:10', '17:45', 30]],
      w8: [['08:10', '17:40', 30], ['08:10', '17:30', 30], ['08:10', '17:40', 30], ['08:15', '17:40', 30], ['08:10', '17:35', 30]],
      w9: [['08:00', '18:00', 30], ['08:00', '17:50', 30], ['08:00', '18:00', 30], ['08:05', '18:00', 30], ['08:00', '17:45', 30]],
      w10: [['08:30', '17:00', 30], ['08:30', '17:00', 30], ['08:30', '16:45', 30], ['08:30', '17:00', 30], ['08:30', '17:00', 30]]
    };
    var n = 100;
    Object.keys(week).forEach(function (w) {
      week[w].forEach(function (d, i) {
        var date = WEEK[i];
        if (d) entries.push(e('e' + (n++), w, date, d[0], d[1], d[2], w === 'w1' && i === 2 ? { note: 'Rain in the afternoon; crew moved to covered work, hours recorded as normal.' } : {}));
        else entries.push({ id: 'e' + (n++), worker: w, date: date, status: 'absent', in: '', out: '', breakMin: 0, note: 'Absent (sample).', enteredBy: 'Mahesh', enteredAt: date + 'T09:00', verifiedBy: 'Suresh K', verifiedAt: date + 'T09:15' });
      });
    });
    var corrections = [
      { id: 'k1', entry: 'e1', changes: { out: '18:10' }, before: { in: '08:02', out: '17:45', breakMin: 30 },
        reason: 'Crew stayed back for the slab pour (ready-mix came late).', enteredBy: 'Mahesh', enteredAt: D + 'T18:40',
        status: 'approved', approvedBy: 'Suresh K', approvedAt: D + 'T18:55' },
      { id: 'k2', entry: 'e3', changes: { in: '07:50' }, before: { in: '08:05', out: '17:40', breakMin: 30 },
        reason: 'Came early to unload the TMT steel lorry; gate register shows 7:50 AM.', enteredBy: 'Mahesh', enteredAt: D + 'T18:15',
        status: 'pending', approvedBy: null, approvedAt: null },
      { id: 'k3', entry: 'e8', changes: { breakMin: 30 }, before: { in: '08:10', out: '17:40', breakMin: 60 },
        reason: 'Lunch break was written twice by mistake; actual break 30 min.', enteredBy: 'Mahesh', enteredAt: D + 'T18:10',
        status: 'pending', approvedBy: null, approvedAt: null }
    ];
    var tasks = [
      { id: 't1', site: 'A', crew: 'c1', task: 'Shuttering', location: 'Block B, 3rd floor', unit: 'sq m', assigned: 220, done: 190,
        assignedBy: 'Suresh K', assignedAt: D + 'T08:15', enteredBy: 'Mahesh', enteredAt: D + 'T17:30', verifiedBy: 'Prakash R', verifiedAt: D + 'T17:45', note: 'Slab edge shuttering left for Monday after the late pour.' },
      { id: 't2', site: 'A', crew: 'c2', task: 'Blockwork', location: 'Block A, 1st floor', unit: 'blocks', assigned: 1200, done: 1310,
        assignedBy: 'Suresh K', assignedAt: D + 'T08:15', enteredBy: 'Mahesh', enteredAt: D + 'T17:35', verifiedBy: null, verifiedAt: null, note: '' },
      { id: 't3', site: 'A', crew: 'c3', task: 'Steel fixing', location: 'Block B, 2nd floor', unit: 't', assigned: 1.5, done: 0.9,
        assignedBy: 'Suresh K', assignedAt: D + 'T08:20', enteredBy: 'Mahesh', enteredAt: D + 'T17:40', verifiedBy: null, verifiedAt: null, note: 'Crew short by one (Deepak absent, Sunil left 2 PM); rain stoppage 2:40-3:30 PM.' },
      { id: 't4', site: 'B', crew: 'c4', task: 'Internal plastering', location: 'Tower 1, ground floor', unit: 'sq m', assigned: 120, done: 85,
        assignedBy: 'Suresh K', assignedAt: D + 'T08:30', enteredBy: 'Mahesh', enteredAt: D + 'T17:30', verifiedBy: 'Prakash R', verifiedAt: D + 'T17:50', note: '' },
      { id: 't5', site: 'B', crew: 'c5', task: 'Footing PCC', location: 'Tower 2, grid C1-C4', unit: 'cu m', assigned: 8, done: 6,
        assignedBy: 'Suresh K', assignedAt: D + 'T08:30', enteredBy: 'Mahesh', enteredAt: D + 'T17:35', verifiedBy: null, verifiedAt: null, note: 'Excavator came 2 hours late.' }
    ];
    var blockers = [
      { id: 'b1', site: 'A', text: 'Ready-mix arrived 2 hours late (supplier delay). Block B slab pour started 3:45 PM instead of 1:30 PM.', enteredBy: 'Mahesh', recordedBy: 'Suresh K', at: D + 'T16:00' },
      { id: 'b2', site: 'A', text: 'Binding wire ran short for Crew 3 at 11 AM; 2 rolls moved from the site store at 12:15 PM.', enteredBy: 'Mahesh', recordedBy: 'Prakash R', at: D + 'T12:20' },
      { id: 'b3', site: 'B', text: 'Excavator for Tower 2 footing booked for 9 AM, arrived 11 AM.', enteredBy: 'Mahesh', recordedBy: 'Suresh K', at: D + 'T11:10' }
    ];
    var rain = [
      { id: 'r1', site: 'A', from: '14:40', to: '15:30', movedTo: 'Covered steel yard (bar cutting and bending)', crews: 'Crew 1, Crew 3',
        hoursNote: 'Hours recorded as normal. Reason: rain stoppage.', enteredBy: 'Mahesh', recordedBy: 'Suresh K', at: D + 'T15:35' }
    ];
    var spot = [
      { id: 's1', site: 'A', time: '12:20', counted: 5, register: 5, by: 'Ramesh', registerBy: 'Mahesh', note: 'Matches register. Deepak M absent.', at: D + 'T12:25' },
      { id: 's2', site: 'B', time: '11:45', counted: 4, register: 4, by: 'Ramesh', registerBy: 'Mahesh', note: 'Matches register.', at: D + 'T11:50' }
    ];
    function mv(id, site, mat, type, qty, note, at, countedBy) {
      return { id: id, site: site, material: mat, type: type, qty: qty, note: note, enteredBy: 'Mahesh', countedBy: countedBy || 'Prakash R', at: at };
    }
    var moves = [
      mv('m1', 'A', 'cement', 'received', 400, 'Week deliveries (sample)', '2026-10-12T10:00'),
      mv('m2', 'A', 'cement', 'used', 265, 'Slab, columns, blockwork mortar', D + 'T17:00'),
      mv('m3', 'A', 'cement', 'returned', 10, 'Damp bags returned to supplier', '2026-10-14T11:00'),
      mv('m4', 'A', 'tmt', 'received', 6, 'Two lorries (sample)', '2026-10-13T09:30'),
      mv('m5', 'A', 'tmt', 'used', 3.4, 'Block B 2nd and 3rd floor', D + 'T17:00'),
      mv('m6', 'A', 'blocks', 'received', 4000, 'Week deliveries (sample)', '2026-10-12T09:00'),
      mv('m7', 'A', 'blocks', 'used', 2510, 'Block A ground and 1st floor', D + 'T17:00'),
      mv('m8', 'A', 'msand', 'received', 40, 'Four loads (sample)', '2026-10-12T08:30'),
      mv('m9', 'A', 'msand', 'used', 26, 'Mortar and plaster', D + 'T17:00'),
      mv('m10', 'B', 'cement', 'received', 150, 'Week deliveries (sample)', '2026-10-12T10:00'),
      mv('m11', 'B', 'cement', 'used', 60, 'PCC and plaster', D + 'T17:00'),
      mv('m12', 'B', 'tmt', 'received', 2, 'One lorry (sample)', '2026-10-13T09:00'),
      mv('m13', 'B', 'tmt', 'used', 0.8, 'Footing mesh', D + 'T17:00'),
      mv('m14', 'B', 'blocks', 'received', 1000, 'Sample', '2026-10-12T09:00'),
      mv('m15', 'B', 'blocks', 'used', 200, 'Compound wall', D + 'T17:00'),
      mv('m16', 'B', 'msand', 'received', 20, 'Two loads (sample)', '2026-10-12T08:30'),
      mv('m17', 'B', 'msand', 'used', 9, 'Plaster', D + 'T17:00')
    ];
    var counts = [
      { id: 'q1', site: 'A', material: 'cement', qty: 125, by: 'Prakash R', at: D + 'T17:30' },
      { id: 'q2', site: 'A', material: 'tmt', qty: 2.6, by: 'Prakash R', at: D + 'T17:30' },
      { id: 'q3', site: 'A', material: 'blocks', qty: 1490, by: 'Prakash R', at: D + 'T17:35' },
      { id: 'q4', site: 'A', material: 'msand', qty: 13.5, by: 'Prakash R', at: D + 'T17:35' },
      { id: 'q5', site: 'B', material: 'cement', qty: 90, by: 'Prakash R', at: D + 'T17:40' },
      { id: 'q6', site: 'B', material: 'tmt', qty: 1.2, by: 'Prakash R', at: D + 'T17:40' },
      { id: 'q7', site: 'B', material: 'blocks', qty: 800, by: 'Prakash R', at: D + 'T17:45' },
      { id: 'q8', site: 'B', material: 'msand', qty: 11, by: 'Prakash R', at: D + 'T17:45' }
    ];
    var mismatches = [
      { id: 'x1', site: 'A', item: 'Ready-mix concrete (M25)', unit: 'cu m', billed: 35, received: 33,
        detail: 'Supplier billed 35 cu m for the Block B slab pour. Site gate log and pour register show 33 cu m received (5 transit mixers).',
        nextStep: 'Check against the supplier invoice and the pour records.', enteredBy: 'Mahesh', notedBy: 'Suresh K', at: D + 'T19:10',
        status: 'open', checkedBy: null, checkedAt: null, checkNote: '' }
    ];
    return { v: 1, workers: workers, crews: crews, entries: entries, corrections: corrections, tasks: tasks, blockers: blockers,
      rain: rain, spot: spot, moves: moves, counts: counts, mismatches: mismatches, log: [] };
  }

  var state;
  function load() {
    try { var s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) { state = s; return s; } } catch (err) { /* fallthrough */ }
    state = seed(); save(); return state;
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
  function reset() { localStorage.removeItem(KEY); state = seed(); save(); return state; }
  function get() { return state || load(); }
  function ui(k, v) {
    var u = {}; try { u = JSON.parse(localStorage.getItem(UIKEY)) || {}; } catch (err) { u = {}; }
    if (arguments.length === 1) return u[k];
    u[k] = v; localStorage.setItem(UIKEY, JSON.stringify(u)); return v;
  }

  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function nowStamp() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fmtTime(t) { var m = P.toMin(t); if (m === null) return '—'; var h = Math.floor(m / 60), mi = m % 60; return ((h % 12) || 12) + ':' + pad(mi) + ' ' + (h < 12 ? 'AM' : 'PM'); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtStamp(s) { if (!s) return '—'; var p = s.split('T'); var d = p[0].split('-'); return (+d[2]) + ' ' + MON[+d[1] - 1] + ', ' + fmtTime(p[1]); }
  function rs(n) { return 'Rs ' + Math.round(n).toLocaleString('en-IN'); }
  function signedRs(n) { return (n > 0 ? '+' : n < 0 ? '−' : '±') + 'Rs ' + Math.abs(Math.round(n)).toLocaleString('en-IN'); }
  function num(n) { return (Math.round(n * 100) / 100).toLocaleString('en-IN'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function worker(id) { return get().workers.find(function (w) { return w.id === id; }); }
  function crew(id) { return get().crews.find(function (c) { return c.id === id; }); }
  function entryCorrections(entryId) { return get().corrections.filter(function (c) { return c.entry === entryId; }).sort(function (a, b) { return a.enteredAt < b.enteredAt ? -1 : 1; }); }
  /** Original entry + APPROVED corrections only. Pending corrections do not count. */
  function effective(entry) {
    var e = { in: entry.in, out: entry.out, breakMin: entry.breakMin };
    entryCorrections(entry.id).forEach(function (c) { if (c.status === 'approved') Object.assign(e, c.changes); });
    return e;
  }
  function payOf(entry, times) {
    if (entry.status === 'absent') return { ok: true, absent: true, payable: 0, pay: 0 };
    var w = worker(entry.worker), t = times || effective(entry);
    return P.computePay(t.in, t.out, t.breakMin, w ? w.rate : NaN);
  }
  function correctionEffect(c) {
    var entry = get().entries.find(function (e) { return e.id === c.entry; });
    var before = payOf(entry, c.before), after = payOf(entry, Object.assign({}, c.before, c.changes));
    return { entry: entry, before: before, after: after, diff: (before.ok && after.ok) ? after.pay - before.pay : null, minDiff: (before.ok && after.ok) ? after.payable - before.payable : null };
  }
  function describeChanges(c) {
    var parts = [];
    if ('in' in c.changes) parts.push('In ' + fmtTime(c.before.in) + ' → ' + fmtTime(c.changes.in));
    if ('out' in c.changes) parts.push('Out ' + fmtTime(c.before.out) + ' → ' + fmtTime(c.changes.out));
    if ('breakMin' in c.changes) parts.push('Break ' + c.before.breakMin + ' → ' + c.changes.breakMin + ' min');
    return parts.join(' · ');
  }
  function siteEntries(site, date) { return get().entries.filter(function (e) { var w = worker(e.worker); return w && w.site === site && e.date === (date || DEMO_DAY); }); }
  function materialSummary(site) {
    var s = get();
    return Object.keys(MATERIALS).map(function (k) {
      var r = { key: k, received: 0, used: 0, returned: 0, moveIn: 0, moveOut: 0 };
      s.moves.forEach(function (m) {
        if (m.site !== site || m.material !== k) return;
        if (m.type === 'received') r.received += m.qty; else if (m.type === 'used') r.used += m.qty; else if (m.type === 'returned') r.returned += m.qty;
        else if (m.type === 'transfer-in') r.moveIn += m.qty; else if (m.type === 'transfer-out') r.moveOut += m.qty;
      });
      r.balance = Math.round((r.received + r.moveIn - r.used - r.returned - r.moveOut) * 100) / 100;
      var cs = s.counts.filter(function (c) { return c.site === site && c.material === k; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
      r.lastCount = cs[0] || null;
      r.countDiff = r.lastCount ? Math.round((r.lastCount.qty - r.balance) * 100) / 100 : null;
      return r;
    });
  }
  function siteSnapshot(site) {
    var s = get(), es = siteEntries(site);
    var present = es.filter(function (e) { return e.status !== 'absent'; }), absent = es.filter(function (e) { return e.status === 'absent'; });
    var mins = 0, pay = 0, fix = 0;
    present.forEach(function (e) { var p = payOf(e); if (p.ok) { mins += p.payable; pay += p.pay; } else fix++; });
    var tasks = s.tasks.filter(function (t) { return t.site === site; });
    var mats = materialSummary(site);
    var flags = s.mismatches.filter(function (m) { return m.site === site && m.status === 'open'; }).length + mats.filter(function (m) { return m.countDiff; }).length;
    var pend = s.corrections.filter(function (c) { if (c.status !== 'pending') return false; var en = s.entries.find(function (e) { return e.id === c.entry; }); return en && worker(en.worker).site === site; }).length;
    return { present: present.length, absent: absent.length, mins: mins, pay: pay, fix: fix, tasks: tasks.length, verified: tasks.filter(function (t) { return t.verifiedBy; }).length, flags: flags, pending: pend,
      unverifiedEntries: es.filter(function (e) { return !e.verifiedBy; }).length };
  }
  function log(text) { get().log.unshift({ text: text, at: nowStamp() }); }

  /* ---------- UI helpers ---------- */
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }
  /** Bottom sheet form. opts: {title, body (html), submit label, onInput(form, preview), onSubmit(form) -> error string | void} */
  function sheet(opts) {
    var d = document.createElement('dialog'); d.className = 'sheet';
    d.innerHTML = '<form method="dialog" novalidate><div class="sheet-head"><h2>' + esc(opts.title) + '</h2><button type="button" class="icon-btn" data-close aria-label="Close">✕</button></div>' +
      '<div class="sheet-body">' + opts.body + '<div class="preview" aria-live="polite"></div><p class="err" role="alert"></p></div>' +
      '<div class="sheet-foot"><button type="button" class="btn ghost" data-close>Cancel</button><button type="submit" class="btn primary">' + esc(opts.submit || 'Save') + '</button></div></form>';
    document.body.appendChild(d);
    var f = d.querySelector('form'), prev = d.querySelector('.preview'), err = d.querySelector('.err');
    function close() { d.close(); d.remove(); }
    d.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    d.addEventListener('cancel', function () { setTimeout(function () { d.remove(); }, 0); });
    if (opts.onInput) { f.addEventListener('input', function () { opts.onInput(f, prev); }); f.addEventListener('change', function () { opts.onInput(f, prev); }); opts.onInput(f, prev); }
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = opts.onSubmit(f);
      if (r) { err.textContent = r; return; }
      close();
    });
    d.showModal();
    var first = f.querySelector('input,select,textarea'); if (first && !('ontouchstart' in window)) first.focus();
    return d;
  }
  function field(label, html, hint) { return '<label class="field"><span>' + esc(label) + '</span>' + html + (hint ? '<small>' + esc(hint) + '</small>' : '') + '</label>'; }
  function select(name, options, val) { return '<select name="' + name + '">' + options.map(function (o) { var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (v === val ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>'; }
  function personOptions(keys) { return keys.map(function (k) { var p = PEOPLE[k]; return [p.name, p.name + ' (' + p.role + ')']; }); }
  function stamp(label, who, at) {
    return who ? '<span class="stamp ok">' + esc(label) + ' <b>' + esc(who) + '</b> · ' + esc(fmtStamp(at)) + '</span>' : '<span class="stamp wait">' + esc(label) + ' — waiting</span>';
  }
  function demoFooter() {
    return '<footer class="demo-foot"><p><b>Demo only.</b> All names, sites and amounts are sample data. Data is stored only on this device (browser localStorage) for the demo. There is no real sync, no real accounts and no backend.</p>' +
      '<p class="foot-actions"><button type="button" class="btn ghost small" data-action="reset">Reset demo data</button> <a class="btn ghost small" href="../">Both apps</a></p></footer>';
  }
  function bindReset(rerender) {
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-action="reset"]'); if (!b) return;
      if (confirm('Reset all demo data on this device back to the sample data?')) { reset(); rerender(); toast('Demo data reset to sample data'); }
    });
    window.addEventListener('storage', function (ev) { if (ev.key === KEY) { load(); rerender(); } });
  }

  window.BNB = {
    KEY: KEY, DEMO_DAY: DEMO_DAY, WEEK: WEEK, DAYNAME: DAYNAME, PEOPLE: PEOPLE, SITES: SITES, MATERIALS: MATERIALS,
    load: load, save: save, reset: reset, get: get, ui: ui, seed: seed, uid: uid, nowStamp: nowStamp, nowHM: nowHM,
    fmtTime: fmtTime, fmtStamp: fmtStamp, fmtHM: P.fmtHM, rs: rs, signedRs: signedRs, num: num, esc: esc,
    worker: worker, crew: crew, entryCorrections: entryCorrections, effective: effective, payOf: payOf, correctionEffect: correctionEffect,
    describeChanges: describeChanges, siteEntries: siteEntries, materialSummary: materialSummary, siteSnapshot: siteSnapshot, log: log,
    toast: toast, sheet: sheet, field: field, select: select, personOptions: personOptions, stamp: stamp, demoFooter: demoFooter, bindReset: bindReset,
    computePay: P.computePay, toMin: P.toMin
  };
})();
