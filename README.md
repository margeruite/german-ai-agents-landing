# German AI Agents Landing Page

## Pages
- `/` — Landing page with hero, comparison, how it works, evaluation form
- `/start` — Personalized chat onboarding (Relevance AI ChatUI)

## How to use
- Open `index.html` for the landing page
- On form submit, you are redirected to `/start` (open `start.html` directly if needed)
- User data is passed to the chat via sessionStorage and URL params

## Customization
- Replace the placeholder ChatUI iframe URL in `start.js` with your actual Relevance AI embed/snippet.

## Styling
- Mobile-first, modern, modular CSS in `styles.css`

## Next steps
- Integrate Relevance AI SDK/API for dynamic chat
- Add backend (Airtable, n8n, LemonSqueezy, etc.) as needed
