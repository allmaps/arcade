import annotationrUrls from '$lib/annotations.json'

import type { ArcadeEnvironment, Buttons } from '$lib/shared/types.js'

export default class WebEnvironment implements ArcadeEnvironment {
  getButtons(): Buttons {
    return [
      { keyCode: 'Space', keyLabel: 'Space' },
      { keyCode: 'ShiftLeft' },
      { keyCode: 'ShiftRight' },
      { keyCode: 'Enter', keyLabel: 'Enter' }
    ]
  }

  getButton(index: number) {
    return this.getButtons()[index]
  }

  async getAnnotationUrls() {
    return annotationrUrls
  }

  async getRandomAnnotationUrl(previousAnnotationUrls: string[]) {
    const filteredAnnotationUrls = (await this.getAnnotationUrls()).filter(
      (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
    )
    return filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]
  }
}
