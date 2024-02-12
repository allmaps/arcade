# Allmaps Arcade

https://arcade.allmaps.org

- About page - by using toggle button on title screen?
- Make toggle work on mobile
- Fix WebGL context lost / memory issues. Are they caused by Allmaps or by OL + vector tiles?
- Timeout for loading annotation and IIIF image tiles
- _Explode_ mask animation on perfect score
- Add heading text to ScoreLarge
- In Results view, perfect score now twice, how to improve? add property to submission: found: boolean
- Show round score in header when no longer showing in center
- Improve `flyTo` function
- Improve `<kbd>` styling
- Also button with icon in Explain
- Icons for all buttons (https://phosphoricons.com/ and https://github.com/haruaki07/phosphor-svelte)
- Titles in explain screen
- Fade-in convex hulls
- Show area overlap in Score.
- Single Footer in Round.svelte
- Transitions between all views, also inside Round
- Fixed max points per game, load 5 annotations before start????
- Loading.svelte:
  - Show max points, show area
  - animate mask!
- Only allow submit if map has moved
- Use real geoMasks in title screen
- Calculate single 3D distance, instead of zoom difference + 2D distance
- Add 3 difficulty levels
  - Easy: current settings
  - Medium: don't show warped map
  - Hard: can't look at map again
- Use MaplibreGL
- Add swipe/pinch gestures to Title screen
- Make sure minZoom/maxZoom/currentZoom is still correct after window resize
- Only show OSM attribution on first game
- Update README, add instructions for running locally

## Running locally

    pnpm link ../allmaps/packages/annotation
    pnpm link ../allmaps/packages/openlayers
    pnpm link ../allmaps/packages/iiif-parser
    pnpm link ../allmaps/packages/tailwind
    pnpm link ../allmaps/packages/transform
    pnpm link ../allmaps/packages/ui
    pnpm link ../allmaps/packages/stdlib

## I-PAC2

- https://www.ultimarc.com/control-interfaces/i-pacs/i-pac2/

Keys:

- 1 SW 5 Z
- 1 SW 6 X
- 1 SW 7 C
- 1 SW 8 V
