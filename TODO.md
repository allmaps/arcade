Things to do (or to consider):

- Only run on browsers that support container-queries? Use supports tag and display modal overlay otherwise?
- Make keyboard shortcut / button explanation responsive + work for cabinet
- Read Protomaps API key from config
- Show text in toggle buttons if there's enough space
- Remove unused Turf.js dependencies
- Add stats by setting `VITE_STATS_WEBSITE_ID` environment variable
- Make sure map focus works on Firefox, on desktop and mobile
- key press should toggle pressed button style
- Fix WebGL context lost / memory issues. Are these caused by the Allmaps MapLibre plugin?
- _Explode_ mask animation on perfect score
- Improve `<kbd>` styling
- Use Svelte icon library for button icons (maybe https://phosphoricons.com/ or https://github.com/haruaki07/phosphor-svelte)
- Make `<ArrowsIcon />` part of `environment.ts`
- Fade-in convex hulls in Results
- Transitions between all views, also inside Round. Fix strange XState/Svelte bug.
- Use real maps in title screen
- Calculate single 3D distance, instead of zoom difference + 2D distance
- Add 3 difficulty levels
  - Easy: current settings
  - Medium: don't show warped map
  - Hard: can't look at map again
- Add swipe/pinch gestures to Title screen
- Make sure minZoom/maxZoom/currentZoom is still correct after window resize
- Find out why https://annotations.allmaps.org/images/f3c00c845d32346b returns a 404 in API