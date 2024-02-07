import type { ArcadeEnvironment, ButtonType, Configuration } from '$lib/shared/types.js'

export default class CabinetEnvironment implements ArcadeEnvironment {
  annotationUrls: string[] = []
  fetched = false

  buttons = {
    toggle: { keyCode: 'KeyZ', bgClass: 'bg-white', icon: true },
    zoomOut: { keyCode: 'KeyX', bgClass: 'bg-yellow', icon: true },
    zoomIn: { keyCode: 'KeyC', bgClass: 'bg-yellow', icon: true },
    submit: { keyCode: 'KeyV', bgClass: 'bg-green', type: 'primary' as const }
  }

  timeoutEnabled = true

  getButton(type: ButtonType) {
    return this.buttons[type]
  }

  onGameEnd() {
    // This is a hack to fix Chrome memory issues on the Arcade cabinet
    window.location.reload()
  }

  async getAnnotationUrls(configuration: Configuration) {
    if (import.meta.env.ARCADE_ANNOTATIONS_DIR) {
      // Fetch JSON directory list from Caddy server
      this.annotationUrls = await fetch(import.meta.env.ARCADE_ANNOTATIONS_DIR, {
        headers: {
          Accept: 'application/json'
        }
      })
        .then((response) => response.json())
        .then(
          (dirList) =>
            dirList.map(
              ({ name }: { name: string }) => `${import.meta.env.ARCADE_ANNOTATIONS_DIR}${name}`
            ) as string[]
        )

      this.fetched = true

      return this.annotationUrls
    } else {
      throw new Error('No ARCADE_ANNOTATIONS_DIR environment variable set')
    }
  }

  async getRandomAnnotationUrl(configuration: Configuration, previousAnnotationUrls: string[]) {
    if (!this.fetched) {
      await this.getAnnotationUrls(configuration)
    }

    const filteredAnnotationUrls = this.annotationUrls.filter(
      (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
    )
    return filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]
  }
}
