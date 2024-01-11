import { writable } from 'svelte/store'

export const failedAnnotationUrls = writable<string[]>([])

export function addFailedAnnotationUrl(annotationUrl: string) {
  if (!annotationUrl) {
    return
  }
  failedAnnotationUrls.update((failedAnnotationUrls) => [...failedAnnotationUrls, annotationUrl])
}

export function resetFailedAnnotationUrls() {
  failedAnnotationUrls.set([])
}
