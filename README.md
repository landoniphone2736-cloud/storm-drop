# Storm Drop .io

An 8-bit multiplayer battle royale. Drop from the ship, grab loot, outlast the storm.

## Files
- `public/index.html` — the whole game (graphics, controls, bots)
- `server.js` — serves the page and relays players' live positions/shots to each other
- `package.json` — tells the host to install `ws` and run `node server.js`

## Run it on your own computer (optional)
1. Install Node.js 18+ from https://nodejs.org
2. In this folder: `npm install` then `npm start`
3. Open http://localhost:3000 in two browser tabs — you're playing against yourself.

## Put it online for free (Render.com)
1. Make a free GitHub account and create a new repository (e.g. `storm-drop`).
2. Upload every file in this folder to it (`server.js`, `package.json`, `README.md`, and the `public` folder). Don't upload `node_modules`.
3. Go to https://render.com, sign up with GitHub, click **New + → Web Service**, and pick your repo.
4. Settings:
   - Runtime: **Node**
   - Build command: `npm install`
   - Start command: `npm start`
   - Instance type: **Free**
5. Click **Create Web Service**. In a minute or two you get a link like `https://storm-drop.onrender.com` — send it to anyone and they're in the same match.

Note: Render's free tier sleeps after ~15 minutes with nobody on it. The first visitor after that waits ~30–60 seconds for it to wake up. Paid tiers ($7/mo) stay awake.

Other hosts that work the same way (Node + WebSockets): Railway, Fly.io, Glitch-style hosts.
Static-only hosts (GitHub Pages, Netlify, itch.io) will load the game but only in solo-vs-bots mode, because they can't run `server.js`.

## Tweaks
- Max players per server: `MAX_PLAYERS` in `server.js` (default 40).
- Bots fill matches up to 10 total combatants — see `spawnBots(clamp(10-hum,3,9))` in `public/index.html`.
