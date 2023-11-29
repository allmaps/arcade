import { writable, get } from 'svelte/store'

import { fetchJson } from '@allmaps/stdlib'

export const annotationUrls = writable<string[]>([])

export const failedAnnotationUrls = writable<string[]>([])

if (import.meta.env.ARCADE_ANNOTATIONS_DIR) {
  // Fetch JSON directory list from Caddy server
  fetch(import.meta.env.ARCADE_ANNOTATIONS_DIR, {
    headers: {
      Accept: 'application/json'
    }
  })
    .then((response) => response.json())
    .then((dirList) => {
      annotationUrls.set(
        dirList.map(
          ({ name }: { name: string }) => `${import.meta.env.ARCADE_ANNOTATIONS_DIR}${name}`
        )
      )
    })
} else if (import.meta.env.ARCADE_ANNOTATIONS_URL) {
  // Fetch JSON file with array of URLs
  fetchJson(import.meta.env.ARCADE_ANNOTATIONS_URL).then((json) => {
    annotationUrls.set(json as string[])
  })
}

export function getRandomAnnotationUrl(previousAnnotationUrls: string[]) {
  // return 'http://localhost/annotations/ce25e56f27790a98.json'
  // return 'http://localhost/annotations/dd8af01a1789ed7e.json'

  const $annotationUrls = get(annotationUrls)
  if ($annotationUrls.length > 0) {
    const filteredAnnotationUrls = $annotationUrls.filter(
      (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
    )

    return filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]
  } else {
    const maxArea = 1_500_000 // 1.500 km², size of the Province of Utrecht
    return `${import.meta.env.ARCADE_RANDOM_ANNOTATIONS_URL}?maxarea=${maxArea}`
  }
}

export function addFailedAnnotationUrl(annotationUrl: string) {
  if (!annotationUrl) {
    return
  }
  failedAnnotationUrls.update((failedAnnotationUrls) => [...failedAnnotationUrls, annotationUrl])
}

export function resetFailedAnnotationUrls() {
  failedAnnotationUrls.set([])
}
