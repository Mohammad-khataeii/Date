# Romantic Gift Card Challenge

A playful React + Vite mini-game where your girlfriend has to remember the date of your first in-person date to unlock the gift reveal.

If she guesses the correct date, the app shows the winning screen and calls a configurable webhook so you can send the Amazon gift card manually.

## Install

```bash
npm install
```

## Run Locally

Create a local `.env` file from `.env.example`, then set your values:

```bash
cp .env.example .env
```

Start the dev server:

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

## Environment Variables

Set the correct answer in `YYYY-MM-DD` format:

```text
VITE_CORRECT_DATE=2025-01-31
```

Do not hardcode the real date into the UI.

To receive a notification when she wins, set a public-safe webhook URL:

```text
VITE_WEBHOOK_URL=https://example.com/webhook
```

When the correct date is submitted, the app sends:

```json
{
  "event": "gift_card_challenge_won",
  "selectedDate": "YYYY-MM-DD",
  "timestamp": "2026-05-01T12:34:56.000Z"
}
```

If `VITE_WEBHOOK_URL` is missing, the app will log the payload to the browser console and still show the win screen.

## Build

```bash
npm run build
```

The production build will be generated in `dist/`.

## Deploy On Vercel

1. Push the repo to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set these environment variables in the Vercel project settings:
   - `VITE_CORRECT_DATE`
   - `VITE_WEBHOOK_URL`
4. Deploy with:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Deploy On Netlify

1. Push the repo to GitHub.
2. Import the repo into [Netlify](https://www.netlify.com).
3. Set these environment variables in site settings:
   - `VITE_CORRECT_DATE`
   - `VITE_WEBHOOK_URL`
4. Use:

```text
Build command: npm run build
Publish directory: dist
```

## Notes

- The app allows exactly 3 attempts.
- The date picker and submit button are disabled after a win or after 3 failed attempts.
- A reset button is available only in development mode.
- Use only public-safe frontend environment variables. Do not place private secrets in Vite env files.
