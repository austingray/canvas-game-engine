# Canvas Game Engine

An HTML5 canvas game engine, because drawing is fun!

## Prerequisites
- Rollup.js: `npm install -g rollup`

## Development
Install node deps:

```bash
npm install
```

Files in `src` compile to the file in `build`. To build/watch:

```bash
npm run watch
```

## Play
You can play directly in the browser by opening `index.html` or you can run in a minimal Electron container with:

```bash
npm start
```

Controls:
- arrow keys/wasd: move character
- tab: switch character
- +/-: increase/decrease movement speed
- space: teleport character to tile 0,0
- 0-9: toggle canvas layer visibility