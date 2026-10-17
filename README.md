# B&B Site Ops — front-end demo (sample data only)

Two phone-first demo web apps for B&B Enterprises, Bangalore. **Demo only:** all names, sites and amounts are sample data. No backend, no real login, no real employee records, no live payroll.

- `/manage/` — Management app (owners & office): Today, Labour, Work, Materials, with a Site A / Site B switcher.
- `/site/` — Site team app: Labourer view (My day, My week) and Engineer view (checks queue). The view switch is for the demo, not a login.

Both apps share one `localStorage` store on the same origin, so an approval in one shows up in the other. Data is stored only on this device. There is no sync, no accounts and no backend. Each app has a "Reset demo data" button.

Pay rule (sample assumption, not company policy): `pay = round((elapsedMinutes - unpaidBreakMinutes) / 60 * hourlyRate)`, worked from exact minutes. Invalid ranges (out before in, overnight, break longer than time on site, missing times) are flagged "needs a fix" and never produce negative pay.

Tests: `node tests/pay.test.js` (pay function), `python3 tests/e2e.py <base-url> <shot-dir>` (headless Chromium walkthrough).
