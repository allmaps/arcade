import { setContext, getContext } from 'svelte'
import { SvelteSet } from 'svelte/reactivity'

const FAILED_ANNOTATION_URLS_KEY = Symbol('failed-annotation-urls')

export class FailedAnnotationUrlsState {
  #failedAnnotationUrls = $state<SvelteSet<string>>(new SvelteSet())

  get failedAnnotationUrls() {
    return this.#failedAnnotationUrls
  }

  addFailedAnnotationUrl(annotationUrl: string) {
    if (!annotationUrl) {
      return
    }
    this.#failedAnnotationUrls.add(annotationUrl)
  }

  resetFailedAnnotationUrls() {
    this.#failedAnnotationUrls.clear()
  }
}

export function setFailedAnnotationUrlsState() {
  return setContext(FAILED_ANNOTATION_URLS_KEY, new FailedAnnotationUrlsState())
}

export function getFailedAnnotationUrlsState() {
  const failedAnnotationUrlsState = getContext<ReturnType<typeof setFailedAnnotationUrlsState>>(
    FAILED_ANNOTATION_URLS_KEY
  )

  if (!failedAnnotationUrlsState) {
    throw new Error('FailedAnnotationUrlsState is not set')
  }

  return failedAnnotationUrlsState
}
