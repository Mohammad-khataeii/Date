# Romantic Gift Card Challenge

A playful React + Vite mini-game that starts sweet, gets annoying on purpose, and ends with a gift-card reveal plus an `EVIDENCE.pdf` download.

## How It Works

1. The date challenge starts with zero attempts.
2. She gets one ridiculous question at a time in a modal.
3. Every `Yes` answer earns one date guess.
4. Every wrong date guess spends one attempt and opens the next question modal.
5. At the end, the app reveals the prank and generates `EVIDENCE.pdf` with every question and answer.

## Install

```bash
npm install
```

## Run Locally

Create a local `.env` file from `.env.example`:

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

The prank date logic is currently hardcoded in the app.

To receive a notification when she wins, set a public-safe webhook URL:

```text
VITE_WEBHOOK_URL=https://example.com/webhook
```

When the winner flow is triggered, the app sends:

```json
{
  "event": "gift_card_challenge_won",
  "selectedDate": "YYYY-MM-DD",
  "timestamp": "2026-05-01T12:34:56.000Z"
}
```

If `VITE_WEBHOOK_URL` is missing, the app logs the payload in the browser console and still shows the winner flow.

## Build

```bash
npm run build
```

The production build will be generated in `dist/`.

## Deploy On Vercel

1. Push the repo to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set this environment variable in the Vercel project settings:
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
3. Set this environment variable in site settings:
   - `VITE_WEBHOOK_URL`
4. Use:

```text
Build command: npm run build
Publish directory: dist
```

## Notes

- The question flow is modal-based and one-at-a-time.
- The final screen auto-prepares and downloads `EVIDENCE.pdf`.
- The PDF includes every question, every answer she gave, and the signature `Clelia Guisgand`.
- A reset button is available only in development mode.
- Use only public-safe frontend environment variables. Do not place private secrets in Vite env files.
