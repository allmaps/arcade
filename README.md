# Allmaps Arcade

https://arcade.allmaps.org

TODO:

- Improve title screen
- Transition border-width for Score component
- Calculate single 3D distance, instead of zoom difference + 2D distance
- Transitions between all views, also inside Round
- Warped map should show directly after returning from toggled submission (update @allmaps/render?)
- Improve `flyTo` function
- Make sure perfect score always is in the middle of the viewport
  - _Explode_ mask on perfect score
- Configuration file per environment (or use git branches for now?)
  - Map bounds
  - Initial lat/lon + zoom
- Only show _Show submission_ button after first zoomed in to warped map
- Show score in the middle of screen after submit!!!
- Improve buttons style + placing
- Make sure buttons look good on cabinet
- Finish button texts
- Show total score in Results view
- Show area overlap in Score.
- In Results view, perfect score now twice, how to improve?
- Loading.svelte:
  - Show max points, show area
  - animate mask!
- Improve Explain screen
  - large text with mask behind text
  - small OL map behind text
  - small warped map behind text
- Only allow submit if map has moved

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
