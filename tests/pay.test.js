// Run: node tests/pay.test.js
const assert = require('assert');
const { computePay, fmtHM, toMin } = require('../shared/pay.js');
let n = 0, fail = 0;
function t(name, fn) { n++; try { fn(); console.log('  ok  ' + name); } catch (e) { fail++; console.log('  FAIL ' + name + '\n       ' + e.message); } }

console.log('Pay function tests');
// Seed data from the spec
t('Ravi corrected: 8:02-18:10, 30 break, Rs95 -> 578 min, Rs 915', () => { const r = computePay('08:02', '18:10', 30, 95); assert.deepStrictEqual([r.ok, r.elapsed, r.payable, r.pay], [true, 608, 578, 915]); assert.strictEqual(fmtHM(r.payable), '9 h 38 m'); });
t('Ravi original: 8:02-17:45 -> 553 min, Rs 876 (correction effect +39)', () => { const r = computePay('08:02', '17:45', 30, 95); assert.strictEqual(r.payable, 553); assert.strictEqual(r.pay, 876); assert.strictEqual(915 - r.pay, 39); });
t('Mohammed Irfan 8:00-18:05, 30, Rs100 -> 9 h 35 m, Rs 958', () => { const r = computePay('08:00', '18:05', 30, 100); assert.strictEqual(fmtHM(r.payable), '9 h 35 m'); assert.strictEqual(r.pay, 958); });
t('Prakash Gowda 8:05-17:40, 30, Rs95 -> 9 h 5 m, Rs 863', () => { const r = computePay('08:05', '17:40', 30, 95); assert.strictEqual(fmtHM(r.payable), '9 h 5 m'); assert.strictEqual(r.pay, 863); });
t('Anil Singh 8:00-17:30, 30, Rs90 -> 9 h, Rs 810', () => { const r = computePay('08:00', '17:30', 30, 90); assert.strictEqual(fmtHM(r.payable), '9 h'); assert.strictEqual(r.pay, 810); });
t('Sunil Yadav 8:00-14:00, 30, Rs90 -> 5 h 30 m, Rs 495', () => { const r = computePay('08:00', '14:00', 30, 90); assert.strictEqual(fmtHM(r.payable), '5 h 30 m'); assert.strictEqual(r.pay, 495); });
// Edge cases
t('zero break', () => { const r = computePay('08:00', '17:00', 0, 90); assert.deepStrictEqual([r.ok, r.payable, r.pay], [true, 540, 810]); });
t('break equal to elapsed -> 0 pay, valid', () => { const r = computePay('08:00', '08:30', 30, 90); assert.deepStrictEqual([r.ok, r.payable, r.pay], [true, 0, 0]); });
t('break longer than elapsed -> needs fix, no pay', () => { const r = computePay('08:00', '08:30', 45, 90); assert.strictEqual(r.ok, false); assert.strictEqual(r.pay, undefined); assert.match(r.error, /longer/); });
t('negative break -> needs fix', () => { const r = computePay('08:00', '17:00', -10, 90); assert.strictEqual(r.ok, false); assert.match(r.error, /negative/); });
t('fractional break -> needs fix', () => { assert.strictEqual(computePay('08:00', '17:00', 12.5, 90).ok, false); });
t('overnight / out before in -> needs fix, never negative', () => { const r = computePay('20:00', '06:00', 30, 95); assert.strictEqual(r.ok, false); assert.match(r.error, /before in/); assert.strictEqual(r.pay, undefined); });
t('out equal to in -> needs fix', () => { assert.strictEqual(computePay('08:00', '08:00', 0, 95).ok, false); });
t('missing in time', () => { const r = computePay('', '17:00', 30, 95); assert.strictEqual(r.ok, false); assert.match(r.error, /In time/); });
t('missing out time', () => { const r = computePay('08:00', null, 30, 95); assert.strictEqual(r.ok, false); assert.match(r.error, /Out time/); });
t('both times missing', () => { assert.strictEqual(computePay(undefined, undefined, 30, 95).ok, false); });
t('invalid time text (25:00, 8:7)', () => { assert.strictEqual(computePay('25:00', '17:00', 0, 95).ok, false); assert.strictEqual(computePay('08:00', '8:7', 0, 95).ok, false); });
t('missing break -> needs fix', () => { assert.strictEqual(computePay('08:00', '17:00', '', 95).ok, false); });
t('missing / negative rate -> needs fix', () => { assert.strictEqual(computePay('08:00', '17:00', 0, '').ok, false); assert.strictEqual(computePay('08:00', '17:00', 0, -5).ok, false); });
t('rounding .5 rounds up (30 min @ Rs95 = 47.5 -> 48)', () => { assert.strictEqual(computePay('08:00', '08:30', 0, 95).pay, 48); });
t('rounding .5 rounds up (1 min @ Rs30 = 0.5 -> 1)', () => { assert.strictEqual(computePay('08:00', '08:01', 0, 30).pay, 1); });
t('rounding just below .5 rounds down (1 min @ Rs29 = 0.483 -> 0)', () => { assert.strictEqual(computePay('08:00', '08:01', 0, 29).pay, 0); });
t('pay is from exact minutes, not rounded hours (9h38m != 9.6h*95)', () => { const r = computePay('08:02', '18:10', 30, 95); assert.notStrictEqual(r.pay, Math.round(9.6 * 95)); assert.notStrictEqual(r.pay, Math.round(10 * 95)); });
t('toMin parses 24h strings', () => { assert.strictEqual(toMin('18:10'), 1090); assert.strictEqual(toMin('7:50'), 470); assert.strictEqual(toMin('x'), null); });
t('fmtHM formats', () => { assert.strictEqual(fmtHM(0), '0 h'); assert.strictEqual(fmtHM(25), '0 h 25 m'); });
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
