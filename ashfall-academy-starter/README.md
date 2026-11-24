# Ashfall Academy — Website Starter

A lightweight, responsive, single-page character roster built with plain HTML, CSS, and JavaScript.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a browser.
3. For a local development server, use VS Code's Live Server extension or run `python -m http.server` from this folder.

## Publish
- Create a GitHub repository.
- Upload the contents of this folder (not the outer ZIP).
- Connect the repository to Cloudflare Pages, or enable GitHub Pages in repository Settings → Pages.
- For Cloudflare Pages, use the root directory `/` and no build command.

## Where to edit
- `js/characters.js`: all student, faculty, and Hell character information.
- `css/style.css`: colors, typography, spacing, responsive layout, cards.
- `index.html`: section headings and page structure.
- `assets/`: add your own images.

## Adding character portraits
Cards currently show intentional portrait placeholders. To use a portrait:
1. Put the image in the appropriate folder under `assets/`.
2. Add an `image` field to that character object in `js/characters.js`, e.g. `"image": "assets/students/celestine.png"`.
3. The current starter can be extended to render that field in the card and dossier. (Image rendering is intentionally left as a simple next-step customization.)

## Notes
- Student year filters and dossier dialogs are functional.
- The Scourge seal reveal is functional.
- All text and data are placeholders/editable.
- The Scourge's revealed dossier is a dramatic presentation, not secure access control. Anything in a public website's source can be inspected.
- Google Fonts are loaded online; system serif fallbacks remain if unavailable.
