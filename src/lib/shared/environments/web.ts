import type { ArcadeEnvironment, ButtonType, Configuration } from '$lib/shared/types.js'

export default class WebEnvironment implements ArcadeEnvironment {
  buttons = {
    toggle: { keyCode: 'Space', keyLabel: 'Space', bgClass: 'bg-white', icon: true },
    zoomOut: { keyCode: 'ShiftLeft', keyLabel: 'Left Shift', bgClass: 'bg-yellow', icon: true },
    zoomIn: { keyCode: 'ShiftRight', keyLabel: 'Right Shift', bgClass: 'bg-yellow', icon: true },
    submit: { keyCode: 'Enter', keyLabel: 'Enter', bgClass: 'bg-green', type: 'primary' as const }
  }

  timeoutEnabled = false

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
