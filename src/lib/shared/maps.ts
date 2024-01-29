import { fetchJson } from '@allmaps/stdlib'
import { parseAnnotation } from '@allmaps/annotation'

export async function fetchMap(annotationUrl: string) {
  const annotation = await fetchJson(annotationUrl)
  const maps = parseAnnotation(annotation)

  const map = maps[Math.floor(Math.random() * maps.length)]

  // if (import.meta.env.DEV && map.id) {
  //   console.log('Copying to clipboard:\n', map.id)
  //   navigator.clipboard.writeText(map.id)
  // }

  return map
}
