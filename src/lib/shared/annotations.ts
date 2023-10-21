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
  'https://annotations.allmaps.org/manifests/718f750d5408814f',
  'https://annotations.allmaps.org/maps/71bdb9db8c165c09',
  'https://annotations.allmaps.org/maps/a097ce9981aee5fd',
  'https://annotations.allmaps.org/images/9562452c7c431b37',
  'https://annotations.allmaps.org/maps/4d352f7d1a309151',
  'https://annotations.allmaps.org/maps/f72b9431c691a7c0',
  'https://annotations.allmaps.org/maps/dd8af01a1789ed7e',
  'https://annotations.allmaps.org/maps/603cadb0e08ac55b',
  'https://annotations.allmaps.org/maps/68e20c1468b759b6'
]

export function getRandomAnnotationUrl(previousAnnotationUrls: string[]) {
  const filteredAnnotationUrls = annotationUrls.filter(
    (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
  )

  const randomAnnotationUrl =
    filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]

  return 'http://annotations.localhost:9584/maps/random'
  return randomAnnotationUrl
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
