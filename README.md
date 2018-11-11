# Canvas Game Engine

An HTML5 canvas game engine, because drawing is fun!

## Prerequisites
- Rollup.js: `npm install -g rollup`

## Development
Not much to see here. Files in `src` compile to the file in `build`. To build/watch:

```bash
$ npm start
```

Include `build/game.bundle.js` in your `index.html`, and then include this script in the document body:

```javascript
const g = new game();
```

`index.html` exists in the repo already for convenience.

## Notes
This is just a fun work in progress.