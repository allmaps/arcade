import type { ArcadeEnvironment, ButtonType, Configuration } from '$lib/shared/types.js'

export default class WebEnvironment implements ArcadeEnvironment {
  buttons = {
    toggle: { keyCode: 'Space', keyLabel: 'Space' },
    zoomOut: { keyCode: 'ShiftLeft', keyLabel: 'Left Shift' },
    zoomIn: { keyCode: 'ShiftRight', keyLabel: 'Right Shift' },
    submit: { keyCode: 'Enter', keyLabel: 'Enter' }
  }

  getButton(type: ButtonType) {
    return this.buttons[type]
  }

  async getAnnotationUrls(configuration: Configuration) {
    return configuration.annotationUrls
  }

  async getRandomAnnotationUrl(configuration: Configuration, previousAnnotationUrls: string[]) {
    const filteredAnnotationUrls = (await this.getAnnotationUrls(configuration)).filter(
      (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
    )
    return filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]
  }
}
