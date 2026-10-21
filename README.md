# Bike-Friendly Neighbourhoods — Full Demo Website

A static GitHub Pages prototype for demonstrating the full workflow:

1. Housing provider registration
2. Provider dashboard
3. 14-question neighbourhood assessment with evidence notes
4. Consolidated action plan with practical recommendations, indicative costs in SEK, priorities and target dates
5. Energicentrum reviewer view with editable recommendations and feedback
6. Approve the plan or return it for changes
7. Provider approved-plan view with implementation tracking

## Files

- `index.html` — page structure, registration dialog, provider dashboard, assessment and review workflow
- `styles.css` — responsive layout and visual design
- `app.js` — registration, local demo persistence, assessment scoring and review interactions

## Deploy to GitHub Pages

1. Download and extract the ZIP archive.
2. Open your GitHub repository: `sandeepani1234/bike-friendly-neighbourhoods`.
3. Choose **Add file → Upload files**.
4. Upload `index.html`, `styles.css`, `app.js`, and `README.md` to the repository root, replacing the old versions.
5. Commit the changes to the branch configured for GitHub Pages.
6. Wait for deployment, then refresh the website. If needed, do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).

## Demo walkthrough

1. Click **Provider portal** and register a sample housing organisation.
2. In the provider dashboard, click **Start / continue**.
3. Answer the assessment questions, optionally add evidence notes, and generate the combined action plan.
4. Open **Energicentrum reviewer** in the action-plan tabs or use the top navigation button.
5. Edit priorities, target dates, recommendations and feedback; submit, approve or return the plan.
6. Open **Provider · approved plan** to see the outcome and update implementation status.

## Important prototype limitations

This is a browser-only demonstration. Profile and workflow data are stored in `localStorage` on the same browser. It is not real registration, there is no authentication or secure role separation, and another user or browser cannot see the saved submission. A production version needs a backend database, secure authentication, server-side authorisation and per-organisation records.

The demo has one active assessment/workflow record in the browser, not separate persisted records for multiple properties. Do not enter real personal or confidential information.
