<script lang="ts">
  import Attribution from '$lib/components/Attribution.svelte'
</script>

<div class="bg-white rounded-lg p-4 lg:p-6 max-w-lg prose lg:prose-xl">
  <h2 class="text-center">About Allmaps Arcade</h2>
  <p>
    Allmaps Arcade is a game made by Bert Spaan. A part of the development was commissioned by the <a
      href="https://heritage.tudelft.nl/">Delft University of Technology Library</a
    >.
  </p>
  <p>
    The game is part of <a href="https://allmaps.org">Allmaps</a>, an open source project for
    curating, georeferencing and exploring IIIF maps.
  </p>
  <p>Credits:</p>
  <ul class="">
    <li>
      Concept & design: <a href="https://luukvandeven.nl/">Luuk van de Ven</a>,
      <a href="https://bertspaan.nl/">Bert Spaan</a> &
      <a href="https://sammeltassen.nl/">Jules Schoonman</a>.
    </li>

    <li>
      <Attribution />. The hosting, styling and rendering of the background map is done by
      <a href="https://protomaps.com/">Protomaps</a>.
    </li>

    <li>
      Built with <a href="https://kit.svelte.dev/">SvelteKit</a>,
      <a href="https://openlayers.org/">OpenLayers</a>
      and
      <a href="https://xstate.js.org/">XState</a>. The source code of Allmaps Arcade is available
      <a href="https://github.com/allmaps/arcade">on GitHub</a>.
    </li>

    <li>
      Georeferenced maps come from the collections of partner institutions of the Allmaps project as
      well as from other libraries, archives and museums with IIIF map collections.
    </li>
  </ul>
</div>
