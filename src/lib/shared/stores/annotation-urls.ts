import { writable } from 'svelte/store'

export const failedAnnotationUrls = writable<string[]>([])

export function addFailedAnnotationUrl(annotationUrl: string) {
  failedAnnotationUrls.update((failedAnnotationUrls) => [...failedAnnotationUrls, annotationUrl])
}
