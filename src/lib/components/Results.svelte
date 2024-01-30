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
  import Zoom from '$lib/components/Zoom.svelte'
  import EyeIcon from '$lib/components/EyeIcon.svelte'
  import NorthArrow from '$lib/components/NorthArrow.svelte'

  import { rounds } from '$lib/shared/machines/game.js'
  import { style as protomapsStyle } from '$lib/shared/protomaps.js'
  import { flyTo } from '$lib/shared/openlayers.js'
  import { maskStyle, convexHullStyle, getExtent } from '$lib/shared/openlayers.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'

  import { PADDING } from '$lib/shared/constants.js'

  let ol: OLMap

  let submissionVectorSource: VectorSource
  let submissionVectorLayer: VectorLayer<VectorSource>

  let convexHullVectorSource: VectorSource
  let convexHullVectorLayer: VectorLayer<VectorSource>

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
      if (showSubmission) {
        flyTo(ol.getView(), [getExtent(round.submission.geoMask)])
      } else {
        flyTo(ol.getView(), [getExtent(round.submission.convexHull), getExtent(round.geoMask)])
      }
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

    submissionVectorSource = new VectorSource()
    submissionVectorLayer = new VectorLayer({
      source: submissionVectorSource,
      style: (feature) => maskStyle(feature.get('color')),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    convexHullVectorSource = new VectorSource()
    convexHullVectorLayer = new VectorLayer({
      source: convexHullVectorSource,
      style: (feature) => convexHullStyle(feature.get('color')),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    for (const round of $rounds) {
      if (round.submitted) {
        warpedMapSource.addGeoreferencedMap(round.map)

        const submissionFeature = new Feature({
          geometry: new GeoJSON().readGeometry(round.submission.geoMask, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        })

        const convexHullFeature = new Feature({
          geometry: new GeoJSON().readGeometry(round.submission.convexHull, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        })

        submissionFeature.set('color', round.colors.color)
        convexHullFeature.set('color', round.colors.convexHullColor)

        submissionVectorSource.addFeature(submissionFeature)
        convexHullVectorSource.addFeature(convexHullFeature)
      }
    }

    ol = new OLMap({
      target: element,
      // @ts-ignore
      layers: [baseLayer, convexHullVectorLayer, warpedMapLayer, submissionVectorLayer],
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

    ol.getView().fit(convexHullVectorSource.getExtent())

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
  ><div class="w-full grid grid-cols-[1fr_max-content_1fr] place-items-end gap-2">
    <div class="grid grid-flow-col gap-2 self-center">
      <Button
        button={$environment.getButton('toggle')}
        verb="toggle rounds"
        on:click={handleShowRounds}
      >
        <EyeIcon />
      </Button>
      <Zoom />
    </div>
    <div>
      <Button
        button={$environment.getButton('submit')}
        verb="start new game"
        on:click={() => gameService.send('NEXT')}
      >
        Start new game
      </Button>
    </div>
    <div class="place-self-end">
      <NorthArrow />
    </div>
  </div></Footer
>
