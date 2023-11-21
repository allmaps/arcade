import {
  ARCADE_ANNOTATIONS_DIR,
  ARCADE_ANNOTATIONS_URL,
  ARCADE_RANDOM_ANNOTATIONS_URL
} from '$env/static/public'

import { fetchJson } from '@allmaps/stdlib'
import { parseAnnotation } from '@allmaps/annotation'

let annotationUrls: string[] = []

if (ARCADE_ANNOTATIONS_DIR) {
  // Fetch JSON directory list from Caddy server
  fetch(ARCADE_ANNOTATIONS_DIR, {
    headers: {
      Accept: 'application/json'
    }
  })
    .then((response) => response.json())
    .then((dirList) => {
      annotationUrls = dirList.map(
        ({ name }: { name: string }) => `${ARCADE_ANNOTATIONS_DIR}${name}`
      )
    })
} else if (ARCADE_ANNOTATIONS_URL) {
  // Fetch JSON file with array of URLs
  fetchJson(ARCADE_ANNOTATIONS_URL).then((json) => {
    annotationUrls = json as string[]
  })
}

export function getRandomAnnotationUrl(previousAnnotationUrls: string[]) {
  if (annotationUrls.length > 0) {
    const filteredAnnotationUrls = annotationUrls.filter(
      (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
    )

    return filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]
  } else {
    const maxArea = 1_500_000 // 1.500 km², size of the Province of Utrecht
    return `${ARCADE_RANDOM_ANNOTATIONS_URL}?maxarea=${maxArea}`
  }
}

export async function fetchMap(annotationUrl: string) {
  const annotation = await fetchJson(annotationUrl)
  const maps = parseAnnotation(annotation)

  const map = maps[Math.floor(Math.random() * maps.length)]

  if (import.meta.env.DEV && map.id) {
    console.log('Copying to clipboard:\n', map.id)
    navigator.clipboard.writeText(map.id)
  }

  return map
}
