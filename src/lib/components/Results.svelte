<script lang="ts">
  import { onMount } from 'svelte'

  import { Map, addProtocol } from 'maplibre-gl'
  import getProtomapsTheme from 'protomaps-themes-base'
  import { Protocol } from 'pmtiles'

  import { combineBboxes, computeBbox } from '@allmaps/stdlib'
  import { WarpedMapLayer } from '@allmaps/maplibre'

  import { actor } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import Score from '$lib/components/Score.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import Zoom from '$lib/components/Zoom.svelte'
  import ArrowsIcon from '$lib/components/ArrowsIcon.svelte'
  import NorthArrow from '$lib/components/NorthArrow.svelte'

  import { rounds } from '$lib/shared/machines/game.js'

  import { generateEmptyFeatureCollection } from '$lib/shared/geojson.js'
  import {
    convexHullStyle,
    maskStyle,
    makeHandleKeydownWithPanStepAndZoomFraction,
    getFirstSymbolLayerId
  } from '$lib/shared/maplibre.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'

  import { MAPLIBRE_PADDING } from '$lib/shared/constants.js'

  import type { GeoJSONSource } from 'maplibre-gl'
  import type { GeojsonPolygon, Bbox } from '@allmaps/types'

  let map: Map

  let warpedMapLayer: WarpedMapLayer

  // TODO: get from config
  const panStep = 150

  let container: HTMLElement

  let selectedRoundIndex: number | undefined = undefined
  let showSubmission = true

  function handleShowRounds(newSelectedRoundIndex?: number) {
    resetLastInteraction()
    if (newSelectedRoundIndex !== undefined) {
      selectedRoundIndex = newSelectedRoundIndex % $rounds.length
    } else {
      if (selectedRoundIndex === undefined) {
        selectedRoundIndex = 0
      } else if (showSubmission) {
        selectedRoundIndex = (selectedRoundIndex + 1) % $rounds.length
      }
    }

    const round = $rounds[selectedRoundIndex]

    if (!round) {
      return
    }

    if (round.submitted) {
      if (showSubmission) {
        map.fitBounds(computeBbox(round.submission.geoMask), {
          padding: MAPLIBRE_PADDING
        })
      } else {
        map.fitBounds(computeBbox(round.geoMask), {
          padding: MAPLIBRE_PADDING
        })
      }
    }

    showSubmission = !showSubmission
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
            tiles: ['https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=ca7652ec836f269a'],
            maxzoom: 14,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: getProtomapsTheme('protomaps', 'light')
      },
      center: [0, 0],
      zoom: 7,
      maxPitch: 0,
      preserveDrawingBuffer: true,
      attributionControl: false
    })

    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

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
      // @ts-expect-error: Incorrect MapLibre typings

      map.addLayer(warpedMapLayer, firstSymbolLayerId)

      const geoMaskPolygons: GeojsonPolygon[] = []
      const convexHullPolygons: GeojsonPolygon[] = []

      let bbox: Bbox | undefined

      for (const round of $rounds) {
        if (round.submitted) {
          warpedMapLayer.addGeoreferencedMap(round.map)

          geoMaskPolygons.push(round.submission.geoMask)
          convexHullPolygons.push(round.submission.convexHull)

          bbox = bbox ? combineBboxes(bbox, computeBbox(round.geoMask)) : computeBbox(round.geoMask)
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

      if (bbox) {
        map.fitBounds(bbox)
      }

      // nu fit bounds

      actor.send({
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

    return () => {
      // TODO: add function to @allmaps/maplibre
      // warpedMapLayer.dispose()
    }
  })
</script>

<div class="w-full h-full relative">
  <div bind:this={container} class="w-full h-full ring-0" tabindex="-1" />
  <ol class="absolute top-0 h-full flex flex-col justify-center">
    {#each $rounds as round, index}
      {#if round.submitted}
        <li class="p-4">
          <button on:click={() => handleShowRounds(index)}>
            <Score {round} border={selectedRoundIndex === index} />
          </button>
        </li>
      {/if}
    {/each}
  </ol>
</div>

<Footer
  ><div class="w-full grid grid-cols-[1fr_max-content_1fr] items-center place-items-end gap-2">
    <div class="grid grid-flow-col gap-2 self-center">
      <Button
        button={$environment.getButton('toggle')}
        verb="toggle rounds"
        on:click={() => handleShowRounds()}
      >
        <ArrowsIcon />
      </Button>
      <Zoom />
    </div>
    <div>
      <Button
        button={$environment.getButton('submit')}
        verb="start new game"
        on:click={() => actor.send({ type: 'NEXT' })}
      >
        New game
      </Button>
    </div>
    <div class="place-self-end">
      <NorthArrow />
    </div>
  </div></Footer
>
