# NEVER BROKE AGAIN — Game Audit
**Date:** March 2026 | **Stack:** React 18 + Three.js (R3F) + Rapier Physics + TypeScript + Vite

---

## CURRENT GAME STATUS

### ✅ WORKING FEATURES

#### Core Engine
- **3D World Rendering** — Three.js via @react-three/fiber, 60fps target
- **Physics** — @react-three/rapier with gravity, capsule collider on player
- **First-Person Camera** — Pitch/yaw mouse look with pointer lock
- **Third-Person Camera** — Toggle with V key, orbit 5m behind player
- **Head Bob** — Realistic walk/sprint camera sway (FP only)
- **Weapon Rendering** — FPS weapon via createPortal (camera-local space, no clip-through)
- **Building Colliders** — Invisible RigidBody walls prevent walking through buildings/world edge

#### Player Controls
- **WASD** — Movement (relative to camera yaw)
- **Shift** — Sprint (2x speed)
- **Space** — Jump with cooldown
- **Mouse** — Look (pointer lock)
- **LMB (mousedown)** — Shoot with cooldown (0.12s)
- **R** — Reload (1.5s delay)
- **E** — Interact with nearby points
- **V** — Toggle 1st/3rd person view
- **F** — Exit vehicle
- **I / G** — Inventory / Garage panels

#### Combat System
- **Raycast Shooting** — Camera-direction ray, hits EnemyNPC meshes
- **Hit Detection** — 34 damage per bullet, kill at 0 HP
- **Ammo System** — Per-weapon ammo counts, auto-reload on empty
- **CoD-Style Crosshair** — Canvas 2D, dynamic spread expands on fire
- **Hit Marker** — X flash on enemy hit (220ms)
- **Kill Feed** — Top-right, fades after 4.5s
- **Damage Vignette** — Red edge flash on taking damage
- **Wanted Stars** — 1–5 stars based on kills/heat
- **Gun Sound Effects** — Procedural Web Audio: pistol/rifle/SMG/shotgun/sniper/launcher/melee
- **Hit/Kill Sounds** — Distinct audio cues for hit confirmation and kills
- **Dry Fire Sound** — Click on empty magazine

#### Enemy NPCs (City Region Only)
- **5 Enemy Spawns** — Scattered through city
- **Chase AI** — Enemies detect player within 18m, chase and attack
- **Enemy Health** — 3 hits to kill (34 dmg each)
- **Respawn** — Auto-respawn 8s after death
- **Enemy Meshes** — Registered for raycast hit detection

#### Map — 3800 Chippewa Street, Baton Rouge
- **Authentic Layout** — Based on real Google Maps Street View reference
- **Shotgun Houses** — 9 north side, 9 south side with authentic Louisiana colors
- **Creole Cottages** — 6 historically accurate with hipped roofs, galleries, shutters
- **Corner Bars** — Chippewa Tavern + South Side Bar with neon signs
- **NBA HQ Building** — Massive warehouse with NEVER BROKE AGAIN billboard (gold neon)
- **NBA Corner Store** — Liquor store with barred windows
- **Live Oak Trees** — 23 trees, authentic wide canopy with Spanish moss
- **Street Lamps** — 9 sodium-vapor amber lamps
- **Utility Poles + Power Lines** — Period-accurate infrastructure
- **Parked Cars** — 10 stationary vehicles (visual only)
- **Rain Particles** — 350-particle rain system
- **Fireflies** — 60-particle ambient glow
- **Puddles** — Reflective ground water
- **Street Signs** — 3800 Chippewa, N 38th, S Acadian Thwy, STOP signs
- **Graffiti Tags** — NBA, 3800, NORTH SIDE, FREE YB wall text
- **Road Markings** — Double yellow center line, lane dashes, curbs, sidewalks
- **Fog** — Warm humid Louisiana night atmosphere

#### Other Regions
- **Mountain World** — Gravedigger Mountain with cold meter mechanic
- **Bayou World** — Bayou environment
- **Travel System** — Highway exit at z=-65, cycles through city→mountain→bayou

#### Vehicle System
- **6 Driveable Spots** — Enter with E, exit with F
- **Car Physics** — Acceleration, steering, friction, max speed 28/40 (sprint)
- **Third-Person Driving Camera** — Follows behind car
- **Speedometer** — Canvas arc gauge bottom-right when driving

#### Economy
- **Money** — Earn from missions, stashes, deals
- **Crew** — Recruit members (Bones, Redd, Nova, Blaze)
- **Street Rep / Fame / Loyalty** — Bars on HUD
- **Level System** — XP from missions, level notifications

#### Stores & Shops
- **Weapons Store** — Buy from 14 weapon types (pistol, SMG, rifle, shotgun, sniper, melee, launcher)
- **Vehicle Dealership** — Buy vehicles
- **Music Store** — Buy music albums
- **Tools Shop** — Buy gear/tools
- **Garage** — Manage owned vehicles
- **Inventory** — View owned items

#### Drug/Street Economy
- **4 Drug Tiers** — Buy low, sell high
- **Heat System** — Drug Heat bar, gets hot at 70+
- **3 Black Market Locations** — City corners and club district
- **Chrome Cafe** — 5 buff items (speed, health, stealth, night vision, armor)
- **Buff Timer** — Active buff shown on HUD with countdown

#### Missions
- **7 Story Missions** — errand, defend, perform, rival, record types
- **DeebaBy Missions** — H-Town Takeover, Broken Promises
- **Objective Compass** — Pink arrow points to nearest active mission
- **Mission Tracker** — Right panel shows active missions with rewards

#### Characters (Dialogue NPCs)
- **yb, ben, rondo, timm, herm, porter** — Original crew
- **deebaby** — H-Town, 2 missions
- **quando, lultimm** — Face texture characters
- **DialoguePanel** — Relationship-based dialogue with recruit/follow options

#### Street Citizens (10 unique)
- **Branching Dialogue** — 3 topic options per citizen
- **YB Storyline Content** — References 3800 Chippewa, NBA label, music career, north side pride
- Characters: Old Man James, Keisha, Cornrow Kenny, Deon, Big Rome, Uncle Jerome, Lil Travis, Quiet Mike, Aaliyah, DJ Smoke

#### UI / HUD
- **Top Bar** — NBA branding, money, fans, level, XP, wanted stars, region, 1P/3P badge
- **Health Bar** — Color-coded (green/yellow/red)
- **Ammo Counter** — Weapon name + current/max ammo
- **Minimap** — 120x120 canvas, player dot + interaction markers
- **Interaction Prompt** — E key popup when near interactable
- **Notification Toasts** — Money, level, mission complete, fan gains
- **Loading Screen** — NEVER BROKE AGAIN title with progress bar
- **Companion Indicators** — Shows which characters are following

---

## ❌ MISSING / NOT YET IMPLEMENTED

### Critical Gameplay
1. **Building Interiors** — No enterable buildings. All buildings are exterior only. Need room geometry + teleport-on-enter system for bar, studio, store, NBA HQ, houses
2. **Visible Player Body in 3rd Person** — No character mesh shown behind camera in TP mode; player is invisible
3. **NPC Pathfinding** — Enemies use simple chase logic; no waypoint navigation, patrol routes, or obstacle avoidance
4. **Advanced Enemy AI** — No flanking, cover-seeking, group coordination, or reaction to sound/sight
5. **Melee Combat** — Melee weapons bought but no swing animation or melee hit detection
6. **Weapon Animations** — No reload animation, no draw animation, static weapon model

### Visuals
7. **Player Character Model** — No visible first-person arms/hands (just floating gun)
8. **Character Animations** — NPCs are static mesh; no walk/idle/talk animations
9. **Enemy Visual Feedback** — No hit ragdoll, death animation, or blood particle
10. **Dynamic Shadows** — Shadows disabled for performance; low-end look
11. **Reflections/PBR** — Basic materials only; no screen-space reflections on puddles
12. **Weather Effects** — Only rain; no wind, lightning, fog variation
13. **Day/Night Cycle** — Always night; no dynamic lighting changes
14. **Vehicle 3D Models** — Driveable cars are invisible (no mesh); only parked cars have geometry

### Audio
15. **Background Music** — No ambient street sounds or music playing in-world
16. **Ambient Sound** — No crickets, distant traffic, bar noise, rain sound
17. **Footstep Sounds** — Audio function exists but not called in movement loop
18. **NPC Voice Lines** — No audio for NPC dialogue
19. **Vehicle Engine Sound** — No engine audio when driving

### Content / Story
20. **YB Story Campaign** — No structured story progression through YB's real life (Chippewa childhood → first arrest → NBA label founding → prison → comeback)
21. **More Missions** — Only 7 missions + 2 DeebaBy; need 20+ missions with cutscenes/dialogue
22. **Cutscenes** — No story cutscenes or dramatic moments
23. **Phone/Menu System** — No in-game phone for contacts, music, or social media
24. **Multiplayer** — No co-op or competitive multiplayer
25. **Save/Load Visual** — Saves to localStorage but no visual save indicator

### World
26. **Map Expansion** — Map ends at z=-65 (highway exit); needs: North Side neighborhood, NBA studio, Baton Rouge downtown, highway system
27. **Interior Spaces** — No rooms, hallways, or building interiors exist as geometry
28. **World Population** — Only 10 interactable citizens; needs 50+ ambient pedestrians
29. **Pedestrian Pathfinding** — No ambient NPCs walking around the world
30. **Destructible Environment** — Can't break windows, doors, fences
31. **Dynamic Events** — No random events (drive-bys, drug busts, confrontations)
32. **Police/Law System** — Wanted stars shown but police don't actually spawn/pursue

### Polish
33. **Settings Menu** — No graphics, audio, or control settings panel
34. **Pause Menu** — No pause with resume/settings/quit
35. **Map Screen** — No full-screen map view
36. **Tutorial** — No guided intro for new players
37. **Achievement System** — No unlockable achievements or trophies
38. **Mobile Support** — No touch controls

---

## PERFORMANCE NOTES

- DPR capped at 1.5 (was 2.0) — good
- 14 point lights (was 47) — significant reduction
- No shadow maps — saves ~10ms/frame on GPU
- Minimap draws at 12fps — efficient
- Combat overlay uses rAF canvas (no React renders) — efficient
- Rain: 350 particles — acceptable
- Fireflies: 60 particles — acceptable
- Buildings: ~200 meshes total — could LOD distant buildings

---

## PRIORITY ROADMAP (for ChatGPT)

### P0 — Must Fix Now
- [ ] First-person hands/arms visible on weapon
- [ ] Enemy death animations + ragdoll
- [ ] Footstep sounds wired up

### P1 — High Impact Next Sprint
- [ ] At least 3 enterable buildings (bar interior, studio interior, NBA HQ interior)
- [ ] Visible player character in 3rd person mode
- [ ] 10 more missions with YB story progression
- [ ] Background ambient audio (rain, street noise)
- [ ] Police spawn + chase system

### P2 — Medium Priority
- [ ] Expanded map: 3 new city blocks north + downtown district
- [ ] 20+ ambient pedestrians with pathfinding
- [ ] Weapon reload animations
- [ ] Vehicle 3D models (currently invisible when driven)
- [ ] YB story campaign: 5-act structure

### P3 — Polish & Content
- [ ] Settings menu (graphics quality, audio volume)
- [ ] Full pause menu
- [ ] Day/night cycle (5-minute loop)
- [ ] Dynamic random events system
- [ ] Phone UI with contacts + music player in-game
- [ ] 30+ missions + 5 story cutscenes
- [ ] Achievement system

---

## FILE MAP

```
src/
  components/game3d/
    GameCanvas.tsx        — Canvas + Physics wrapper, region switching
    Player.tsx            — FPS/TPS movement, shooting, sounds, V-key toggle
    FirstPersonWeapon.tsx — Camera-local weapon via createPortal
    ChippewaWorld.tsx     — Full 3800 Chippewa scene + building colliders
    MountainWorld.tsx     — Mountain region
    BayouWorld.tsx        — Bayou region
    GameHUD.tsx           — All HUD: crosshair, minimap, health, ammo, toasts
    InteractionPanel.tsx  — All panel UIs: missions, store, cafe, drugs, citizens
    DialoguePanel.tsx     — Character relationship dialogue
    StorePanel.tsx        — Buy weapons/vehicles/tools/music
    CharacterModel.tsx    — NPC visual renderer
    EnemyNPC.tsx          — Enemy AI + spawning
    LoadingScreen.tsx     — NEVER BROKE AGAIN loading screen
  context/
    GameContext.tsx        — All game state + reducer (200+ actions)
  data/
    gameData.ts           — initialGameState, missions, save/load
    characters.ts         — CHARACTERS array (10 NPCs)
    interactions.ts       — All interaction points (60+)
    storeData.ts          — WEAPONS, VEHICLES, TOOLS, MUSIC_CATALOG
    cyberData.ts          — DRUGS, CAFE_ITEMS, MEETUP_SPOTS
  stores/
    playerStore.ts        — Position, movement, cameraMode (mutable, no React)
    enemyStore.ts         — Enemy health/mesh registry
    combatStore.ts        — Hit/kill/spread timers (mutable, no React)
    drivingStore.ts       — Car physics state
  utils/
    audioManager.ts       — Procedural Web Audio gunshots/sounds
  types/
    game.ts               — GameState TypeScript interfaces
```

---

*Generated by Claude Code — Never Broke Again v1.0*
