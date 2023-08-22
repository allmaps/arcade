import { fetchJson } from '@allmaps/stdlib'
import { parseAnnotation } from '@allmaps/annotation'

const annotationUrls = [
  'https://annotations.allmaps.org/images/7e878f46e9fd1f3d',
  'https://annotations.allmaps.org/images/429775761c71fd3a',
  'https://annotations.allmaps.org/images/21c23f5e87c7af1d',
  'https://annotations.allmaps.org/images/c8a3b5c5859f4339',
  'https://annotations.allmaps.org/images/dfc152fb043b671a',
  'https://annotations.allmaps.org/images/648025be6c447efc',
  'https://annotations.allmaps.org/manifests/718f750d5408814f',
  'https://annotations.allmaps.org/manifests/02c7b8df6fac1378',
  'https://annotations.allmaps.org/images/9f888622a47479cc',
  'https://annotations.allmaps.org/images/3d3cb6e11cb24f96',
  'https://annotations.allmaps.org/manifests/718f750d5408814f'
]

export function getRandomAnnotationUrl(previousAnnotationUrls: string[]) {
  const filteredAnnotationUrls = annotationUrls.filter(
    (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
  )

  const randomAnnotationUrl =
    filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]

  return randomAnnotationUrl
}

export async function fetchMap(annotationUrl: string) {
  const annotation = await fetchJson(annotationUrl)
  const maps = parseAnnotation(annotation)

  return maps[0]
}
