<script lang="ts">
  import { onMount } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import VectorTile from 'ol/layer/VectorTile.js'
  import VectorSource from 'ol/source/Vector.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import GeoJSON from 'ol/format/GeoJSON.js'
  import Feature from 'ol/Feature.js'

  import { applyStyle } from 'ol-mapbox-style'

  import { WarpedMapSource, WarpedMapLayer } from '@allmaps/openlayers'

  import { gameService } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import Score from './Score.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { rounds } from '$lib/shared/machines/game.js'
  import { style as protomapsStyle } from '$lib/shared/protomaps.js'
  import { flyTo } from '$lib/shared/openlayers.js'
  import { maskStyle, getGeoMaskExtent } from '$lib/shared/openlayers.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'

  import { PADDING } from '$lib/shared/constants.js'

  let ol: OLMap

  let vectorSource: VectorSource
  let vectorLayer: VectorLayer<VectorSource>

  let element: HTMLElement

  let selectedRoundIndex: number | undefined = undefined
  let showSubmission = true

  function handleShowRounds() {
    resetLastInteraction()
    if (selectedRoundIndex === undefined) {
      selectedRoundIndex = 0
    } else if (showSubmission) {
      selectedRoundIndex = (selectedRoundIndex + 1) % $rounds.length
    }

    const round = $rounds[selectedRoundIndex]

    if (round.submitted) {
      const geoMask = showSubmission ? round.submission.geoMask : round.geoMask
      flyTo(ol.getView(), getGeoMaskExtent(geoMask))
    }

    showSubmission = !showSubmission
  }

  onMount(() => {
    const baseLayer = new VectorTile({ declutter: true, maxZoom: 20 })
    applyStyle(baseLayer, protomapsStyle)

    const warpedMapSource = new WarpedMapSource()
    const warpedMapLayer = new WarpedMapLayer({
      source: warpedMapSource
    })

    vectorSource = new VectorSource()
    vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => maskStyle(feature.get('color')),

      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    for (const round of $rounds) {
      if (round.submitted) {
        warpedMapSource.addGeoreferencedMap(round.map)

        const feature = new Feature({
          geometry: new GeoJSON().readGeometry(round.submission.geoMask, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        })

        feature.set('color', round.colors.color)

        vectorSource.addFeature(feature)
      }
    }

    ol = new OLMap({
      target: element,
      // @ts-ignore
      layers: [baseLayer, warpedMapLayer, vectorLayer],
      controls: [],
      view: new View({
        center: [0, 0],
        maxZoom: 24,
        zoom: 2,
        padding: PADDING,
        enableRotation: false
      }),
      keyboardEventTarget: element
    })

    ol.getView().fit(vectorSource.getExtent())

    gameService.send({
      type: 'SET_OL_MAP',
      ol
    })

    element.focus()

    return () => {
      warpedMapLayer.dispose()
      warpedMapSource.dispose()
    }
  })
</script>

<div class="w-full h-full relative">
  <div bind:this={element} id="ol-map" class="w-full h-full ring-0" tabindex="-1" />
  <ol class="absolute top-0 h-full flex flex-col justify-center">
    {#each $rounds as round, index}
      {#if round.submitted}
        <li class="p-4">
          <Score {round} border={selectedRoundIndex === index} />
        </li>
      {/if}
    {/each}
  </ol>
</div>

<Footer
  ><div class="w-full flex flex-row items-end [&>*]:w-1/3">
    <div>
      <Button keyCode={$environment.getButton(0).keyCode} on:click={handleShowRounds}>
        Show rounds <ArcadeButtonIcon button={$environment.getButton(0)} />
      </Button>
    </div>
    <div class="flex justify-center">
      <Button keyCode={$environment.getButton(3).keyCode} on:click={() => gameService.send('NEXT')}
        >Press <ArcadeButtonIcon button={$environment.getButton(3)} /> for new game
      </Button>
    </div>
    <div />
  </div>
</Footer>
