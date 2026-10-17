/* B&B Site Ops demo — pay maths (shared by both apps and the unit tests).
   pay = round((elapsedMinutes - unpaidBreakMinutes) / 60 * hourlyRate)
   Computed from exact minutes, never from rounded display hours.
   SAMPLE ASSUMPTION for the demo, not company policy. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BNBPay = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** "HH:MM" (24 h) -> minutes since midnight, or null if missing/invalid. */
  function toMin(t) {
    if (typeof t !== 'string') return null;
    var m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
    if (!m) return null;
    var h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
  }

  /**
   * Returns {ok:true, elapsed, payable, pay} or {ok:false, error}.
   * Never returns negative pay: invalid input is flagged "needs a fix".
   */
  function computePay(inTime, outTime, breakMin, rate) {
    var a = toMin(inTime), b = toMin(outTime);
    if (a === null && b === null) return { ok: false, error: 'In and out time missing' };
    if (a === null) return { ok: false, error: 'In time missing or invalid' };
    if (b === null) return { ok: false, error: 'Out time missing or invalid' };
    if (b === a) return { ok: false, error: 'In and out time are the same' };
    if (b < a) return { ok: false, error: 'Out time is before in time (overnight or typo)' };
    var elapsed = b - a;
    if (breakMin === '' || breakMin === null || breakMin === undefined)
      return { ok: false, error: 'Break minutes missing (enter 0 if no break)', elapsed: elapsed };
    var br = Number(breakMin);
    if (!Number.isFinite(br) || !Number.isInteger(br))
      return { ok: false, error: 'Break must be a whole number of minutes', elapsed: elapsed };
    if (br < 0) return { ok: false, error: 'Break cannot be negative', elapsed: elapsed };
    if (br > elapsed) return { ok: false, error: 'Break is longer than the time on site', elapsed: elapsed };
    var r = Number(rate);
    if (rate === '' || rate === null || rate === undefined || !Number.isFinite(r) || r < 0)
      return { ok: false, error: 'Hourly rate missing or invalid', elapsed: elapsed };
    var payable = elapsed - br;
    // payable*rate/60 is the same formula as payable/60*rate, done in this
    // order so integer products stay exact before the single rounding step.
    var pay = Math.round((payable * r) / 60);
    return { ok: true, elapsed: elapsed, payable: payable, pay: pay };
  }

  /** 578 -> "9 h 38 m", 540 -> "9 h", 25 -> "0 h 25 m" */
  function fmtHM(min) {
    if (!Number.isFinite(min)) return '—';
    var h = Math.floor(min / 60), m = min % 60;
    return m === 0 ? h + ' h' : h + ' h ' + m + ' m';
  }

  return { toMin: toMin, computePay: computePay, fmtHM: fmtHM };
});
