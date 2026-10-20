# Lost & Found · 30-Day Date Calculator

Internal calculator for Match Date → Donation Date → 7-Day Notice.

**Live site:** https://yulic-prog.github.io/lost-found-date-calculator/

## Run

```bash
npm install
npm run dev
```

Then open the local URL printed in the terminal.

```bash
npm test
npm run build
```

## What it calculates

- **Donation Date** = Match Date + 30 calendar days
- **7-Day Notice** = Donation Date − 7 calendar days

All calculations use calendar days.

## 7-Day Notice Excel banner

The corner banner shows the latest **Match Date** to enter in the 7-Day Notice Excel today. That is the match date whose 7-Day Notice falls on today (23 calendar days earlier).

Today follows Pacific time (`America/Los_Angeles`), including daylight saving.

Example: on 20 October the banner reads **27 September**. Enter anything from that date and earlier. Don't go over. The date moves forward one day every calendar day.
