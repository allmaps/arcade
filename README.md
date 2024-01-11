# Allmaps Arcade

https://arcade.allmaps.org

TODO:

- Improve title screen
- Warped map should show directly after returning from toggled submission (update @allmaps/render?)
- Improve `flyTo` function
- Make sure perfect score always is in the middle of the viewport
  - _Explode_ mask on perfect score
- Configuration file per environment (or use git branches for now?)
  - `annotations.json``
  - Map bounds
  - Initial lat/lon + zoom
  - Min./max. area
- Focus map in Results view (make sure arrows and zoom in/out work)
- Show convex hulls of submission and warped map in Results view
- Only show _Show submission_ button after first zoomed in to warped map
- Show score in the middle of screen after submit
- Improve buttons style + placing
- Add modal game time progress bar

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
