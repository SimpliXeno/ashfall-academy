# Ashfall Academy — Website

A responsive, static site built with plain HTML, CSS, and JavaScript. No build step or framework required.

## Run locally
Open `index.html` in a browser, or run `python -m http.server` from this folder.

## Publish
Use GitHub Pages or Cloudflare Pages. Set the project root to `/` and leave the build command empty.

## Where to edit
- `js/characters.js`: character records and optional image/state data.
- `js/site.js`: rendering and interactions.
- `css/style.css`: visual design and responsive layout.
- `index.html`: page content and section structure.
- `assets/`: add portraits and backgrounds.

## Character portraits
Add an image path to a character object:
```js
"image": "assets/students/celestine.png"
```
The portrait appears on the tarot card and in the dossier. Paths are relative to the repository root.

## Character states
A character can have alternate states/forms without duplicating their roster entry. Add a `states` array to that character:
```js
"states": [
  {
    "label": "Academy",
    "image": "assets/students/name-academy.png",
    "description": "Description shown for this state."
  },
  {
    "label": "Below",
    "image": "assets/students/name-below.png",
    "description": "Alternate appearance or state description."
  }
]
```
Each state can optionally override `role`, `age`, `appearance`, `affinities`, `br`, and `potential`. Any omitted value falls back to the character's main record. The state tabs only appear when there are at least two states. Add as many states as needed.

## Interactions
- Student year filters and dossier dialogs.
- Optional character state tabs.
- Scourge seal requires a sustained press (mouse, touch, or pen); releasing early resets the attempt.
- The gate countdown is a 90-second ceremonial animation when scrolled into view. It is atmospheric, not a live story-calendar timer.
- The reading ceremony includes an affinity-web illustration, five potential grades, and ten Blood Ranks.

## Lore / spoiler note
The Scourge section intentionally reveals only Blood Rank IX, Potential V, and Totality. The portrait and further description remain unavailable. As with any public static website, anything embedded in source files can be inspected; visual secrecy is not secure access control.

Google Fonts are loaded online; system serif fallbacks remain if unavailable.
