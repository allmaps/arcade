export const tileUrl = 'https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=507ade1803ce471c'

export const style = {
  version: 8,
  glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
  sources: {
    protomaps: {
      type: 'vector',
      tiles: ['https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=507ade1803ce471c'],
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>'
    }
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#dddddd'
      }
    },
    {
      id: 'earth',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'earth',
      paint: {
        'fill-color': '#e7f1ee'
      }
    },
    {
      id: 'landuse_park',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: [
        'any',
        [
          'in',
          'pmap:kind',
          'national_park',
          'park',
          'cemetery',
          'protected_area',
          'nature_reserve',
          'forest',
          'golf_course'
        ]
      ],
      paint: {
        'fill-color': '#c2f7d1'
      }
    },
    {
      id: 'landuse_hospital',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['==', 'pmap:kind', 'hospital']],
      paint: {
        'fill-color': '#ffeae8'
      }
    },
    {
      id: 'landuse_industrial',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['==', 'pmap:kind', 'industrial']],
      paint: {
        'fill-color': '#f8ffed'
      }
    },
    {
      id: 'landuse_school',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['in', 'pmap:kind', 'school', 'university', 'college']],
      paint: {
        'fill-color': '#f2fef9'
      }
    },
    {
      id: 'landuse_beach',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['in', 'pmap:kind', 'beach']],
      paint: {
        'fill-color': '#eff5e7'
      }
    },
    {
      id: 'landuse_zoo',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['in', 'pmap:kind', 'zoo']],
      paint: {
        'fill-color': '#EBE6ED'
      }
    },
    {
      id: 'landuse_military',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['in', 'pmap:kind', 'military', 'naval_base', 'airfield']],
      paint: {
        'fill-color': '#EBE6ED'
      }
    },
    {
      id: 'natural_wood',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: ['any', ['in', 'pmap:kind', 'wood', 'nature_reserve', 'forest']],
      paint: {
        'fill-color': '#eafbe9'
      }
    },
    {
      id: 'landuse_pedestrian',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['==', 'pmap:kind', 'pedestrian']],
      paint: {
        'fill-color': '#eef0f0'
      }
    },
    {
      id: 'natural_scrub',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: ['in', 'pmap:kind', 'scrub', 'grassland', 'grass'],
      paint: {
        'fill-color': 'rgb(219,239,209)'
      }
    },
    {
      id: 'natural_glacier',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: ['==', 'pmap:kind', 'glacier'],
      paint: {
        'fill-color': 'white'
      }
    },
    {
      id: 'natural_sand',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'natural',
      filter: ['==', 'pmap:kind', 'sand'],
      paint: {
        'fill-color': '#eff5e7'
      }
    },
    {
      id: 'landuse_aerodrome',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['in', 'pmap:kind', 'aerodrome']],
      paint: {
        'fill-color': '#dbe7e7'
      }
    },
    {
      id: 'transit_runway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      filter: ['any', ['in', 'pmap:kind_detail', 'runway']],
      paint: {
        'line-color': '#d1d9d9',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 10, 0, 10.5, 2, 15, 6]
      }
    },
    {
      id: 'transit_taxiway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      minzoom: 13,
      filter: ['any', ['in', 'pmap:kind_detail', 'taxiway']],
      paint: {
        'line-color': '#d1d9d9',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 0, 13.5, 1, 15, 6]
      }
    },
    {
      id: 'landuse_runway',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      minzoom: 14,
      filter: ['any', ['in', 'pmap:kind_detail', 'runway', 'taxiway']],
      paint: {
        'fill-color': '#d1d9d9'
      }
    },
    {
      id: 'water',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'water',
      paint: {
        'fill-color': '#a4cae1'
      }
    },
    {
      id: 'landuse_pier',
      type: 'fill',
      source: 'protomaps',
      'source-layer': 'landuse',
      filter: ['any', ['==', 'pmap:kind', 'pier']],
      paint: {
        'fill-color': '#e7f1ee'
      }
    },
    {
      id: 'roads_tunnels_other_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['in', 'pmap:kind', 'other', 'path']],
      paint: {
        'line-color': '#ffffff',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 14, 0, 14.5, 0.5, 20, 12]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_tunnels_minor_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:kind', 'minor_road']],
      paint: {
        'line-color': '#e2e2e2',
        'line-dasharray': [3, 2],
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_tunnels_link_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:link', 1]],
      paint: {
        'line-color': '#e2e2e2',
        'line-dasharray': [3, 2],
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_tunnels_medium_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:kind', 'medium_road']],
      paint: {
        'line-color': '#e1e1e1',
        'line-dasharray': [3, 2],
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 20, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 10, 0, 10.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_tunnels_major_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:kind', 'major_road']],
      paint: {
        'line-color': '#e3cfd3',
        'line-dasharray': [3, 2],
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 19, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 9, 0, 9.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_tunnels_highway_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        ['<', 'pmap:level', 0],
        ['==', 'pmap:kind', 'highway'],
        ['!=', 'pmap:link', 1]
      ],
      paint: {
        'line-color': '#ebcea2',
        'line-dasharray': [3, 2],
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 3, 0, 3.5, 0.5, 18, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_tunnels_other',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['in', 'pmap:kind', 'other', 'path']],
      paint: {
        'line-color': '#f7f7f7',
        'line-dasharray': [1, 1],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 14, 0, 14.5, 0.5, 20, 12]
      }
    },
    {
      id: 'roads_tunnels_minor',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:kind', 'minor_road']],
      paint: {
        'line-color': '#ebebeb',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 32]
      }
    },
    {
      id: 'roads_tunnels_link',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:link', 1]],
      paint: {
        'line-color': '#ebebeb',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 20, 32]
      }
    },
    {
      id: 'roads_tunnels_medium',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:kind', 'medium_road']],
      paint: {
        'line-color': '#ebebeb',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 20, 32]
      }
    },
    {
      id: 'roads_tunnels_major',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['<', 'pmap:level', 0], ['==', 'pmap:kind', 'major_road']],
      paint: {
        'line-color': '#ebebeb',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 19, 32]
      }
    },
    {
      id: 'roads_tunnels_highway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        ['<', 'pmap:level', 0],
        ['==', 'pmap:kind', 'highway'],
        ['!=', 'pmap:link', 1]
      ],
      paint: {
        'line-color': '#ebebeb',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 3, 0, 3.5, 0.5, 18, 32]
      }
    },
    {
      id: 'physical_line_stream',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'physical_line',
      minzoom: 14,
      filter: ['all', ['in', 'pmap:kind', 'stream']],
      paint: {
        'line-color': '#a4cae1',
        'line-width': 0.5
      }
    },
    {
      id: 'physical_line_river',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'physical_line',
      minzoom: 9,
      filter: ['all', ['in', 'pmap:kind', 'river']],
      paint: {
        'line-color': '#a4cae1',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 9, 0, 9.5, 1, 18, 12]
      }
    },
    {
      id: 'buildings',
      type: 'fill-extrusion',
      source: 'protomaps',
      'source-layer': 'buildings',
      paint: {
        'fill-extrusion-color': '#cbcece',
        'fill-extrusion-height': ['to-number', ['get', 'height']],
        'fill-extrusion-opacity': 0.5
      }
    },
    {
      id: 'transit_pier',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      filter: ['any', ['==', 'pmap:kind', 'pier']],
      paint: {
        'line-color': 'white',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 16]
      }
    },
    {
      id: 'roads_minor_service_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 13,
      filter: [
        'all',
        ['==', 'pmap:level', 0],
        ['==', 'pmap:kind', 'minor_road'],
        ['==', 'pmap:kind_detail', 'service']
      ],
      paint: {
        'line-color': '#e2e2e2',
        'line-gap-width': [
          'interpolate',
          ['exponential', 1.6],
          ['zoom'],
          13,
          0,
          13.5,
          0.25,
          20,
          24
        ],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 0, 13.5, 0.8]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_minor_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        ['==', 'pmap:level', 0],
        ['==', 'pmap:kind', 'minor_road'],
        ['!=', 'pmap:kind_detail', 'service']
      ],
      paint: {
        'line-color': '#e2e2e2',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 24],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.6]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_link_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 13,
      filter: ['all', ['==', 'pmap:link', 1]],
      paint: {
        'line-color': '#e2e2e2',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 0, 13.5, 0.5, 20, 24],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 0, 13.5, 2]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_medium_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['==', 'pmap:level', 0], ['==', 'pmap:kind', 'medium_road']],
      paint: {
        'line-color': '#e1e1e1',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 20, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 10, 0, 10.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_major_casing_late',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['==', 'pmap:level', 0], ['==', 'pmap:kind', 'major_road']],
      paint: {
        'line-color': '#e3cfd3',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 19, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 9, 0, 9.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_highway_casing_late',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 13,
      filter: [
        'all',
        ['==', 'pmap:level', 0],
        ['==', 'pmap:kind', 'highway'],
        ['!=', 'pmap:link', 1]
      ],
      paint: {
        'line-color': '#ebcea2',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 3, 0, 3.5, 0.5, 18, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_other',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['==', 'pmap:level', 0], ['in', 'pmap:kind', 'other', 'path']],
      paint: {
        'line-color': '#ffffff',
        'line-dasharray': [2, 1],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 14, 0, 14.5, 0.5, 20, 12]
      }
    },
    {
      id: 'roads_link',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['==', 'pmap:link', 1]],
      paint: {
        'line-color': 'white',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 0, 13.5, 1, 20, 24]
      }
    },
    {
      id: 'roads_minor_service',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        ['==', 'pmap:level', 0],
        ['==', 'pmap:kind', 'minor_road'],
        ['==', 'pmap:kind_detail', 'service']
      ],
      paint: {
        'line-color': 'white',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 13, 0, 13.5, 0.25, 20, 24]
      }
    },
    {
      id: 'roads_minor',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        ['==', 'pmap:level', 0],
        ['==', 'pmap:kind', 'minor_road'],
        ['!=', 'pmap:kind_detail', 'service']
      ],
      paint: {
        'line-color': 'white',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 32]
      }
    },
    {
      id: 'roads_medium',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['==', 'pmap:level', 0], ['==', 'pmap:kind', 'medium_road']],
      paint: {
        'line-color': '#ffffff',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 20, 32]
      }
    },
    {
      id: 'roads_major_casing_early',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      maxzoom: 13,
      filter: ['all', ['==', 'pmap:level', 0], ['==', 'pmap:kind', 'major_road']],
      paint: {
        'line-color': '#e3cfd3',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 19, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 9, 0, 9.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_major',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: ['all', ['==', 'pmap:level', 0], ['==', 'pmap:kind', 'major_road']],
      paint: {
        'line-color': '#ffffff',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 6, 0, 6.5, 0.5, 19, 32]
      }
    },
    {
      id: 'roads_highway_casing_early',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      maxzoom: 13,
      filter: [
        'all',
        ['==', 'pmap:level', 0],
        ['==', 'pmap:kind', 'highway'],
        ['!=', 'pmap:link', 1]
      ],
      paint: {
        'line-color': '#ebcea2',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 3, 0, 3.5, 0.5, 18, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_highway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        ['==', 'pmap:level', 0],
        ['==', 'pmap:kind', 'highway'],
        ['!=', 'pmap:link', 1]
      ],
      paint: {
        'line-color': '#fefffc',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 3, 0, 3.5, 0.5, 18, 32]
      }
    },
    {
      id: 'transit_railway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      filter: ['all', ['==', 'pmap:kind', 'rail']],
      paint: {
        'line-color': '#b3bcc9',
        'line-width': 2
      }
    },
    {
      id: 'transit_railway_tracks',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'transit',
      filter: ['all', ['==', 'pmap:kind', 'rail']],
      paint: {
        'line-color': '#ffffff',
        'line-width': 0.8,
        'line-dasharray': [6, 10]
      }
    },
    {
      id: 'boundaries_country',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'boundaries',
      filter: ['<=', 'pmap:min_admin_level', 2],
      paint: {
        'line-color': '#5c4a6b',
        'line-width': 1
      }
    },
    {
      id: 'boundaries',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'boundaries',
      filter: ['>', 'pmap:min_admin_level', 2],
      paint: {
        'line-color': '#5c4a6b',
        'line-width': 0.5,
        'line-dasharray': [3, 2]
      }
    },
    {
      id: 'roads_bridges_other_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['in', 'pmap:kind', 'other', 'path']],
      paint: {
        'line-color': '#ffffff',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 14, 0, 14.5, 0.5, 20, 12]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_bridges_link_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:link', 1]],
      paint: {
        'line-color': '#e2e2e2',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 1, 20, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 2]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_bridges_minor_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:kind', 'minor_road']],
      paint: {
        'line-color': '#e2e2e2',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_bridges_medium_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:kind', 'medium_road']],
      paint: {
        'line-color': '#e1e1e1',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 20, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 10, 0, 10.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_bridges_major_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:kind', 'major_road']],
      paint: {
        'line-color': '#e3cfd3',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 19, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 9, 0, 9.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_bridges_highway_casing',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: [
        'all',
        ['>', 'pmap:level', 0],
        ['==', 'pmap:kind', 'highway'],
        ['!=', 'pmap:link', 1]
      ],
      paint: {
        'line-color': '#ebcea2',
        'line-gap-width': ['interpolate', ['exponential', 1.6], ['zoom'], 3, 0, 3.5, 0.5, 18, 32],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 1]
      },
      layout: {
        visibility: 'visible'
      }
    },
    {
      id: 'roads_bridges_other',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['in', 'pmap:kind', 'other', 'path']],
      paint: {
        'line-color': '#ffffff',
        'line-dasharray': [2, 1],
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 14, 0, 14.5, 0.5, 20, 12]
      }
    },
    {
      id: 'roads_bridges_minor',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:kind', 'minor_road']],
      paint: {
        'line-color': 'white',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 0.5, 20, 32]
      }
    },
    {
      id: 'roads_bridges_link',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:link', 1]],
      paint: {
        'line-color': 'white',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 12, 0, 12.5, 1, 20, 32]
      }
    },
    {
      id: 'roads_bridges_medium',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:kind', 'medium_road']],
      paint: {
        'line-color': '#ffffff',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 20, 32]
      }
    },
    {
      id: 'roads_bridges_major',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 12,
      filter: ['all', ['>', 'pmap:level', 0], ['==', 'pmap:kind', 'major_road']],
      paint: {
        'line-color': '#ffffff',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 7, 0, 7.5, 0.5, 19, 32]
      }
    },
    {
      id: 'roads_bridges_highway',
      type: 'line',
      source: 'protomaps',
      'source-layer': 'roads',
      filter: [
        'all',
        ['>', 'pmap:level', 0],
        ['==', 'pmap:kind', 'highway'],
        ['!=', 'pmap:link', 1]
      ],
      paint: {
        'line-color': '#fefffc',
        'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 3, 0, 3.5, 0.5, 18, 32]
      }
    },
    {
      id: 'physical_line_waterway_label',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'physical_line',
      minzoom: 13,
      filter: ['all', ['in', 'pmap:kind', 'river', 'stream']],
      layout: {
        'symbol-placement': 'line',
        'text-font': ['Noto Sans Regular'],
        'text-field': ['get', 'name'],
        'text-size': 12,
        'text-letter-spacing': 0.3
      },
      paint: {
        'text-color': '#a4cae1',
        'text-halo-color': 'white',
        'text-halo-width': 2
      }
    },
    {
      id: 'physical_point_peak',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'physical_point',
      minzoom: 15,
      filter: ['any', ['==', 'pmap:kind', 'peak']],
      layout: {
        'text-font': ['Noto Sans Regular'],
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-max-width': 9
      },
      paint: {
        'text-color': '#61bb5b',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
      }
    },
    {
      id: 'roads_labels_minor',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 15,
      filter: ['any', ['in', 'pmap:kind', 'minor_road', 'other', 'path']],
      layout: {
        'symbol-sort-key': ['get', 'pmap:min_zoom'],
        'symbol-placement': 'line',
        'text-font': ['Noto Sans Regular'],
        'text-field': ['get', 'name'],
        'text-size': 12
      },
      paint: {
        'text-color': '#91888b',
        'text-halo-color': 'white',
        'text-halo-width': 2
      }
    },
    {
      id: 'pois_high_zooms',
      type: 'symbol',
      source: 'protomaps',
      minzoom: 15,
      'source-layer': 'pois',
      filter: ['any', ['>=', ['get', 'pmap:min_zoom'], 13]],
      layout: {
        'symbol-sort-key': ['get', 'pmap:min_zoom'],
        'text-font': ['Noto Sans Regular'],
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-max-width': 9,
        'icon-padding': ['interpolate', ['linear'], ['zoom'], 0, 2, 14, 2, 16, 20, 17, 2, 22, 2]
      },
      paint: {
        'text-color': '#757d91',
        'text-halo-color': 'white',
        'text-halo-width': 1.5
      }
    },
    {
      id: 'physical_point_ocean',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'physical_point',
      filter: [
        'any',
        ['in', 'pmap:kind', 'sea', 'ocean', 'lake', 'water', 'bay', 'strait', 'fjord']
      ],
      layout: {
        'text-font': ['Noto Sans Regular'],
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-letter-spacing': 0.1,
        'text-max-width': 9
      },
      paint: {
        'text-color': 'white',
        'text-halo-color': '#a4cae1',
        'text-halo-width': 1
      }
    },
    {
      id: 'roads_labels_major',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'roads',
      minzoom: 11,
      filter: ['any', ['in', 'pmap:kind', 'highway', 'major_road', 'medium_road']],
      layout: {
        'symbol-sort-key': ['get', 'pmap:min_zoom'],
        'symbol-placement': 'line',
        'text-font': ['Noto Sans Regular'],
        'text-field': ['get', 'name'],
        'text-size': 12
      },
      paint: {
        'text-color': '#91888b',
        'text-halo-color': 'white',
        'text-halo-width': 2
      }
    },
    {
      id: 'places_subplace',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: ['==', 'pmap:kind', 'neighbourhood'],
      layout: {
        'symbol-sort-key': ['get', 'pmap:min_zoom'],
        'text-field': '{name}',
        'text-font': ['Noto Sans Regular'],
        'text-max-width': 7,
        'text-padding': 4,
        'text-size': {
          base: 1.2,
          stops: [
            [11, 10],
            [14, 12]
          ]
        },
        'text-transform': 'uppercase'
      },
      paint: {
        'text-color': '#757d91',
        'text-halo-color': 'white',
        'text-halo-width': 1
      }
    },
    {
      id: 'pois_important',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'pois',
      filter: ['any', ['<', ['get', 'pmap:min_zoom'], 13]],
      layout: {
        'symbol-sort-key': ['get', 'pmap:min_zoom'],
        'text-font': ['Noto Sans Regular'],
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-max-width': 9,
        'icon-padding': ['interpolate', ['linear'], ['zoom'], 0, 2, 14, 2, 16, 20, 17, 2, 22, 2]
      },
      paint: {
        'text-color': '#757d91',
        'text-halo-color': 'white',
        'text-halo-width': 1.5
      }
    },
    {
      id: 'places_locality_circle',
      type: 'circle',
      source: 'protomaps',
      'source-layer': 'places',
      filter: ['==', 'pmap:kind', 'locality'],
      paint: {
        'circle-radius': 2,
        'circle-stroke-width': 2,
        'circle-stroke-color': 'white',
        'circle-color': '#666666'
      },
      maxzoom: 8
    },
    {
      id: 'places_locality',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: ['==', 'pmap:kind', 'locality'],
      layout: {
        'text-field': '{name}',
        'text-font': ['Noto Sans Regular'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4,
          [
            'case',
            ['<', ['get', 'pmap:population_rank'], 10],
            11,
            ['>=', ['get', 'pmap:population_rank'], 10],
            12,
            0
          ],
          6.99,
          [
            'case',
            ['<', ['get', 'pmap:population_rank'], 9],
            11,
            ['>=', ['get', 'pmap:population_rank'], 9],
            13,
            0
          ],
          15,
          [
            'case',
            ['<', ['get', 'pmap:population_rank'], 8],
            12,
            ['>=', ['get', 'pmap:population_rank'], 8],
            14,
            0
          ]
        ],
        'icon-padding': ['interpolate', ['linear'], ['zoom'], 0, 2, 8, 4, 10, 8, 12, 6, 22, 2],
        'text-anchor': {
          stops: [
            [7, 'left'],
            [8, 'center']
          ]
        },
        'text-radial-offset': 0.2
      },
      paint: {
        'text-color': '#787878',
        'text-halo-color': 'white',
        'text-halo-width': 1
      }
    },
    {
      id: 'places_region',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: ['==', 'pmap:kind', 'region'],
      layout: {
        'symbol-sort-key': ['get', 'pmap:min_zoom'],
        'text-field': '{name}',
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-radial-offset': 0.2,
        'text-anchor': 'center',
        'text-transform': 'uppercase'
      },
      paint: {
        'text-color': '#bdbdbd',
        'text-halo-color': 'White',
        'text-halo-width': 0.5
      }
    },
    {
      id: 'places_country',
      type: 'symbol',
      source: 'protomaps',
      'source-layer': 'places',
      filter: ['==', 'pmap:kind', 'country'],
      layout: {
        'symbol-sort-key': ['get', 'pmap:min_zoom'],
        'text-field': '{name}',
        'text-font': ['Noto Sans Bold'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          2,
          [
            'case',
            ['<', ['get', 'pmap:population_rank'], 10],
            11,
            ['>=', ['get', 'pmap:population_rank'], 10],
            12,
            0
          ],
          6,
          [
            'case',
            ['<', ['get', 'pmap:population_rank'], 8],
            11,
            ['>=', ['get', 'pmap:population_rank'], 8],
            14,
            0
          ],
          8,
          [
            'case',
            ['<', ['get', 'pmap:population_rank'], 7],
            12,
            ['>=', ['get', 'pmap:population_rank'], 7],
            20,
            0
          ]
        ],
        'icon-padding': ['interpolate', ['linear'], ['zoom'], 0, 2, 14, 2, 16, 20, 17, 2, 22, 2],
        'text-transform': 'uppercase'
      },
      paint: {
        'text-color': '#9590aa',
        'text-halo-color': 'white',
        'text-halo-width': 1
      }
    }
  ]
}
