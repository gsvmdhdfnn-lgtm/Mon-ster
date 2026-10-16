# Mon-ster

A virtual world for collecting creatures.

## Foundation 001 — movement playground

The first build deliberately tests only the world foundation:

- 20×20 logical grid (1 square = 1 step)
- click/tap ground to walk
- A* pathfinding with diagonal movement
- smooth 360° camera rotation
- limited pitch and zoom
- 3 blocked trees
- 3 blocked rocks
- 1 Nibbit occupying a blocked square
- click Nibbit to pathfind to a neighbouring square
- walking only — running is intentionally unavailable until a future mon ability grants it

No combat, capture/bonding, inventory, quests, interiors, or progression yet.

## Run

This is a static prototype. Serve the repository over HTTP (rather than opening `index.html` directly) and load it in a modern browser. The Three.js module is loaded from jsDelivr.

## Controls

- Click/tap ground: move
- Drag: rotate/pitch camera
- Mouse wheel or pinch: zoom
- Click/tap Nibbit: approach
- Reset camera: return to the default view
