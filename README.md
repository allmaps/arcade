# Allmaps Arcade

https://arcade.allmaps.org

TODO:

- Transition border-width for Score component
- Improve `flyTo` function
- Make sure perfect score always is in the middle of the viewport
  - _Explode_ mask on perfect score
- Configuration file per environment. Use in map initialization:
  - Map bounds
  - Initial lat/lon + zoom
- Only show _Show submission_ button after first zoomed in to warped map
- Show score in the middle of screen after submit!!!
- Improve buttons style + placing
- Improve `<kbd>` styling
- Make sure buttons look good on cabinet
- Show total score in Results view
- In Results view, perfect score now twice, how to improve?
- Correct text for cabinet and web: e.g. joystick / arrow keys
- Improve Explain screen
  - large text with mask behind text
  - small OL map behind text
  - small warped map behind text
- Finish tooltips

==== LATER ==========================================

- Create logo for title screen
- Show area overlap in Score.
- Transitions between all views, also inside Round
- Loading.svelte:
  - Show max points, show area
  - animate mask!
- Only allow submit if map has moved
- Use real geoMasks in title screen
- Calculate single 3D distance, instead of zoom difference + 2D distance
- Add 3 difficulty levels
  - Easy:
  - Medium:
  - Hard:
- Use MaplibreGL
- Add swipe/pinch gestures to Title screen

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
