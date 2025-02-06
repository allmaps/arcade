<script lang="ts">
  import { onMount } from 'svelte'

  import { Map, addProtocol } from 'maplibre-gl'
  import getProtomapsTheme from 'protomaps-themes-base'
  import { Protocol } from 'pmtiles'

  import { computeBbox } from '@allmaps/stdlib'
  import { WarpedMapLayer } from '@allmaps/maplibre'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'

  import Overlay from '$lib/components/Overlay.svelte'
  import Score from '$lib/components/Score.svelte'
  import TotalScore from '$lib/components/TotalScore.svelte'
  import Header from '$lib/components/Header.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Buttons from '$lib/components/Buttons.svelte'
  import Button from '$lib/components/Button.svelte'
  import Zoom from '$lib/components/Zoom.svelte'
  import ArrowsIcon from '$lib/components/ArrowsIcon.svelte'

  import { RESULTS_ROUND_MS } from '$lib/shared/constants.js'
  import { generateEmptyFeatureCollection } from '$lib/shared/geojson.js'
  import {
    flyTo,
    convexHullStyle,
    maskStyle,
    makeHandleKeydownWithPanStepAndZoomFraction,
    getFirstSymbolLayerId
  } from '$lib/shared/maplibre.js'

  import { MAPLIBRE_PADDING } from '$lib/shared/constants.js'

  import type { GeoJSONSource } from 'maplibre-gl'
  import type { GeojsonPolygon, Point } from '@allmaps/types'

  import type { SubmittedRound } from '$lib/shared/types.js'

  const { snapshot, send, rounds } = getSnapshotState()
  const gameTimeoutState = getGameTimeoutState()

  let map: Map

  let warpedMapLayer: WarpedMapLayer

  const firstRound = $rounds[0] as SubmittedRound

  // TODO: get from config
  const panStep = 150

  let container: HTMLElement

  type SelectedRound = {
    index: number
    view: 'submission' | 'warpedMap'
  }

  let selectedRound: SelectedRound = $state({
    index: 0,
    view: 'warpedMap'
  })

  let intervalId: number | undefined = $state()

  function handleShowRounds(newSelectedRoundIndex?: number) {
    if (newSelectedRoundIndex !== undefined) {
      clearInterval(intervalId)
    }
    gameTimeoutState.resetLastInteraction()
    if (newSelectedRoundIndex !== undefined) {
      selectedRound = {
        index: newSelectedRoundIndex % $rounds.length,
        view: 'warpedMap'
      }
    } else {
      if (
        selectedRound.view === 'warpedMap' &&
        !($rounds[selectedRound.index] as SubmittedRound).submission.found
      ) {
        selectedRound = {
          index: selectedRound.index,
          view: 'submission'
        }
      } else {
        selectedRound = {
          index: (selectedRound.index + 1) % $rounds.length,
          view: 'warpedMap'
        }
      }
    }

    const round = $rounds[selectedRound.index]

    if (!round) {
      return
    }

    if (round.submitted) {
      if (selectedRound.view === 'submission' && !round.submission.found) {
        map.fitBounds(computeBbox(round.submission.geoMask), {
          padding: MAPLIBRE_PADDING
        })
      } else {
        map.fitBounds(computeBbox(round.geoMask), {
          padding: MAPLIBRE_PADDING
        })
      }
    }
  }

  onMount(() => {
    const protocol = new Protocol()
    addProtocol('pmtiles', protocol.tile)

    map = new Map({
      container,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sources: {
          protomaps: {
            type: 'vector',
            tiles: [import.meta.env.ARCADE_PMTILES_URL],
            maxzoom: 14,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: getProtomapsTheme('protomaps', 'light')
      },
      center: $snapshot.context.configuration.map.center as Point,
      zoom: $snapshot.context.configuration.map.initialZoom,
      maxPitch: 0,
      preserveDrawingBuffer: true,
      attributionControl: false
    })

    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    map.on('movestart', (event) => {
      if (event.originalEvent) {
        clearInterval(intervalId)
      }
    })

    map.on('load', () => {
      const firstSymbolLayerId = getFirstSymbolLayerId(map)

      map.addSource('submission', {
        type: 'geojson',
        data: generateEmptyFeatureCollection()
      })

      map.addSource('convex-hull', {
        type: 'geojson',
        data: generateEmptyFeatureCollection()
      })

      map.addLayer(
        {
          id: 'submission',
          type: 'line',
          source: 'submission',
          ...maskStyle(['get', 'color'])
        },
        firstSymbolLayerId
      )

      map.addLayer(
        {
          id: 'convex-hull',
          type: 'fill',
          source: 'convex-hull',
          ...convexHullStyle(['get', 'color'])
        },
        firstSymbolLayerId
      )

      warpedMapLayer = new WarpedMapLayer()

      // @ts-expect-error: MapLibre typings are incomplete
      map.addLayer(warpedMapLayer, firstSymbolLayerId)

      const geoMaskPolygons: GeojsonPolygon[] = []
      const convexHullPolygons: GeojsonPolygon[] = []

      for (const round of $rounds) {
        if (round.submitted) {
          warpedMapLayer.addGeoreferencedMap(round.map)

          geoMaskPolygons.push(round.submission.geoMask)
          convexHullPolygons.push(round.submission.convexHull)
        }
      }

      const submissionSource = map.getSource('submission') as GeoJSONSource
      submissionSource.setData({
        type: 'FeatureCollection',
        features: geoMaskPolygons.map((geoMask, index) => ({
          type: 'Feature',
          geometry: geoMask,
          properties: {
            index,
            color: $rounds[index].colors.color
          }
        }))
      })

      const convexHullSource = map.getSource('convex-hull') as GeoJSONSource
      convexHullSource.setData({
        type: 'FeatureCollection',
        features: convexHullPolygons.map((convexHull, index) => ({
          type: 'Feature',
          geometry: convexHull,
          properties: {
            index,
            color: $rounds[index].colors.convexHullColor
          }
        }))
      })

      // if (bbox) {
      //   firstRound.geoMask
      // }

      const center = firstRound.submission.center.warpedMap
      const zoom = firstRound.submission.zoom.warpedMap

      flyTo(map, center, zoom)

      // nu fit bounds

      send({
        type: 'SET_MAP_KEYBOARD_TARGET',
        element: map.getCanvas(),
        library: 'maplibre'
      })
    })

    // actor.send({
    //   type: 'SET_OL_MAP',
    //   ol
    // })

    // MapLibre's regular keyboard handler rounds the zoom level
    // when zooming with the keyboard. Override the keydown
    // handler to prevent this.
    // @ts-expect-error: MapLibre typings are incomplete
    map.keyboard.keydown = makeHandleKeydownWithPanStepAndZoomFraction(panStep)

    // element.focus()

    intervalId = setInterval(() => {
      handleShowRounds()
    }, RESULTS_ROUND_MS)

    return () => {
      clearInterval(intervalId)
      map.removeLayer('warped-map-layer')
      map.remove()
    }
  })
</script>

<div class="w-full h-full relative">
  <div bind:this={container} class="w-full h-full ring-0" tabindex="-1"></div>
</div>
<!-- class="p-4 gap-4 top-0 h-full grid grid-cols-[repeat(5,_auto)] w-full max-w-full justify-center" -->
<!-- style:grid-template-columns={`repeat(${$rounds.length}, 1fr)`} -->
<Overlay>
  {#snippet header()}
    <Header>
      <div class="flex flex-col items-center gap-3">
        <TotalScore />
        <ol
          class="md:p-4 gap-2 md:gap-4 top-0 w-full h-full flex flex-row max-w-2xl justify-center"
        >
          {#each $rounds as round, index}
            {#if round.submitted}
              <li class="flex-1 flex justify-center">
                <button onclick={() => handleShowRounds(index)}>
                  <Score
                    {round}
                    border={selectedRound.index === index}
                    showPoints={selectedRound.index === index}
                  />
                </button>
              </li>
            {/if}
          {/each}
        </ol>
      </div>
    </Header>
  {/snippet}

  {#snippet footer()}
    <Footer>
      {#snippet buttons()}
        <Buttons>
          <Button
            button={$snapshot.context.environment.getButton('toggle')}
            verb="toggle rounds"
            onclick={() => {
              clearInterval(intervalId)
              handleShowRounds()
            }}
          >
            <ArrowsIcon />
          </Button>

          <Zoom />
        </Buttons>
      {/snippet}

      <Button
        button={$snapshot.context.environment.getButton('submit')}
        verb="start new game"
        onclick={() => send({ type: 'NEXT' })}
      >
        New game
      </Button>
    </Footer>
  {/snippet}
</Overlay>
