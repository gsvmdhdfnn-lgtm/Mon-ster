# Mon-ster

A virtual world for collecting creatures.

## Visual Proof 001 — the little clearing

Playable preview: https://gsvmdhdfnn-lgtm.github.io/Mon-ster/

An art pass over Foundation 001, with its original 20×20 movement map and camera controls preserved:

- Seeded, painted meadow ground with winding earth patches; no visible grid.
- Grass and small meadow flowers drawn with instancing, clustered low-poly tree crowns, rooted trunks, and mossy rocks.
- Warm directional lighting, soft shadows, atmospheric fog, and a shallow earth base.
- A small explorer with a hat, teal coat, orange scarf, backpack, and walking animation.
- A round rabbit-mole Nibbit with a cream belly and muzzle, long inset ears, bright eyes, digging paws/claws, and subtle idle motion.
- A quiet destination ring and compact woodland-styled interface.

The artwork lives in `art.js`; the navigation and camera remain in `index.html`. Decoration adds no blocked cells. The terrain surface stays level so the existing walking and picking logic remain reliable. No external art assets or additional production dependencies are required.

### Foundation retained

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
- Mouse wheel: zoom
- Click/tap Nibbit: approach
- Reset camera: return to the default view

## Validation

Visual Proof 001 was checked in desktop Edge/Chromium with WebGL:

- JavaScript syntax checks for both modules; no browser runtime errors.
- Paths to all 393 walkable cells, rejecting all seven occupied cells and preventing diagonal corner cutting.
- Actual pointer clicks for ground movement, blocked destinations, and Nibbit approach, including clicking Nibbit again when already beside it.
- More than 360° of camera drag, pitch and zoom limits, reset, and viewport resize.
- Visual inspection at 1440×1000, including the default view and Nibbit approach.

The default view measured approximately 15,658 rendered triangles and 94 draw calls (renderer counters, not a frame-rate guarantee). Grass and flowers use two instanced draw calls. Pixel density is capped at 2 and the shadow map at 2048². Mobile Safari compatibility has not been verified; this proof targets desktop playability.

## Character motion pass

The explorer now uses distance-driven steps with alternating planted and lifted boots, bending legs, shoulder-based arm swing, body weight shift, and scarf follow-through. The pose eases back to standing on arrival without changing movement speed or camera tracking.

Nibbit breathes, blinks, sniffs, twitches its ears, and makes little digging motions. Nearby explorers get a turn, a curious head tilt, and a greeting hop. Its navigation cell and clickable approach behavior are unchanged.

Browser regression checks passed again, plus sampled checks for alternating foot contact/lift, arm swing, return to rest, blinking, sniffing, and digging. No runtime errors.

## Nibbit roaming

Nibbit chooses a free cardinal neighbour after a random pause and hops there. It respects the map boundary, trees, rocks, the player, and the player’s planned route. Both hop endpoints are temporarily reserved for pathfinding, with the old cell released on landing. Clicking a moving Nibbit targets a neighbour of its landing cell. It pauses while being approached or while the explorer is nearby, then resumes wandering after the explorer leaves.

Validated with 25,000 simulated roaming updates (boundaries, obstacle/route avoidance, and reservation cleanup), an actual mid-hop pointer click and approach, nearby pausing, and the desktop movement/camera regression checks.
