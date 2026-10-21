# Bike-Friendly Neighbourhoods — Gotland

A responsive, static website prototype for a proposed cycling-facilities assessment programme.

## Run locally

No build tools are required.

1. Download or clone this repository.
2. Open `index.html` in a browser.

For a local development server, you can use the VS Code Live Server extension or run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new repository on GitHub, for example `bike-friendly-neighbourhoods`.
2. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to finish deploying. The published URL will be shown in the Pages settings.

Every push to the selected branch will update the site after deployment.

## What works in this prototype

- Responsive public homepage and programme overview.
- Interactive 14-question assessment with 0/1/2 scores.
- Completion progress and provisional score/star calculation.
- Rule-based action-plan suggestions for answers scored 0 or 1.
- Evidence notes in the current browser session.
- Clear labels that results are provisional and require human approval.

## Important limitations

This is a **front-end demonstration**, not a production assessment platform. It does not include accounts, a real database, private evidence uploads, administrator permissions, server-enforced approval, durable saving, PDF exports, or secure publication workflow. The assessment lives only in the current page session and resets when the page is reloaded.

GitHub Pages hosts static files only. To support real housing-provider accounts and Energicentrum's approval process, add a backend such as Supabase or another server/database service, configure authentication and row-level security, and implement approval rules on the server. Never store secret keys in front-end JavaScript.

The programme name, design, criteria, rating thresholds, action templates and cost guidance are prototype suggestions. Confirm them with Energicentrum before real-world use. No official endorsement or approval is implied.

## Files

- `index.html` — page structure and content
- `styles.css` — visual design and responsive layout
- `app.js` — assessment scoring and action-plan demo logic
