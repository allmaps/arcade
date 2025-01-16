import type { ArcadeEnvironment, ButtonType, Configuration } from '$lib/shared/types.js'

export default class DefaultEnvironment implements ArcadeEnvironment {
  annotationUrls = [
    'https://annotations.allmaps.org/maps/a7b30d806ba1fb3c@67affa1cc88d9ef6',
    'https://annotations.allmaps.org/maps/7044e91ab1c516f6@b53e446d820fe885',
    'https://annotations.allmaps.org/maps/34a3abc6a8034a6e@4fc3dd9964af49c2',
    'https://annotations.allmaps.org/maps/5bac051c791988f9@3188e4bf29f3b07e',
    'https://annotations.allmaps.org/maps/71bdb9db8c165c09@0ccd5394f56d7dab',
    'https://annotations.allmaps.org/maps/a30fe03d1c513063@d71b164fd142d7aa',
    'https://annotations.allmaps.org/maps/1f0b6bda18465004@00b7be6247e9d8f0',
    'https://annotations.allmaps.org/maps/bb465b29e9380673@cdee79cf0c9fe456'
  ]

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
    return this.annotationUrls
  }

  async getRandomAnnotationUrl(configuration: Configuration, previousAnnotationUrls: string[]) {
    const filteredAnnotationUrls = this.annotationUrls.filter(
      (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
    )
    return filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]
  }
}
