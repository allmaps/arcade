<script lang="ts">
  import { Logo } from '@allmaps/ui'

  import Attribution from '$lib/components/Attribution.svelte'
  import Face from '$lib/components/Face.svelte'

  import faceJules from '$lib/images/faces/jules.jpg'
  import faceBert from '$lib/images/faces/bert.jpg'
  import faceLuuk from '$lib/images/faces/luuk.jpg'
</script>

<div
  class="min-h-min max-h-full pointer-events-auto overflow-auto bg-white/50 backdrop-blur-md rounded-2xl shadow-md p-4 lg:p-6 max-w-lg md:max-w-xl prose prose-sm md:prose-base"
>
  <h2 class="text-center">
    About Allmaps <span class="w-10 inline-block [&>*]:inline-block"><Logo inverted={false} /></span
    >
    Arcade
  </h2>
  <p>
    Allmaps Arcade is a game made by <a href="https://bertspaan.nl">Bert Spaan</a>. The development
    of the initial version was commissioned by the
    <a href="https://heritage.tudelft.nl/">Delft University of Technology Library</a>.
  </p>
  <p>
    The game is part of <a href="https://allmaps.org">Allmaps</a>, an open source project for
    curating, georeferencing and exploring IIIF maps.
  </p>

  <p>Credits:</p>
  <ul>
    <li>
      Concept & design: <Face name="Luuk van de Ven" href="https://luukvandeven.nl"
        ><img src={faceLuuk} alt="Luuk van de Ven" /></Face
      >,
      <Face name="Bert Spaan" href="https://bertspaan.nl"
        ><img src={faceBert} alt="Bert Spaan" /></Face
      > and <Face name="Jules Schoonman" href="https://www.tudelft.nl/en/staff/j.a.schoonman"
        ><img src={faceJules} alt="Jules Schoonman" /></Face
      >.
    </li>

    <li>
      <Attribution />.
      <a href="https://protomaps.com/">Protomaps</a> is used to host, style and render the background
      map.
    </li>

    <li>
      Built with <a href="https://kit.svelte.dev/">SvelteKit</a>,
      <a href="https://maplibre.org/">MapLibre</a>
      and
      <a href="https://xstate.js.org/">XState</a>. The source code of Allmaps Arcade is available
      <a href="https://github.com/allmaps/arcade">on GitHub</a>.
    </li>

    <li>
      Georeferenced maps come from the collections of <a href="https://allmaps.org/#partners"
        >partner institutions</a
      >
      of the Allmaps project as well as from other libraries, archives and museums with
      <a href="https://github.com/allmaps/iiif-map-collections">IIIF map collections</a>.
    </li>
  </ul>
</div>
