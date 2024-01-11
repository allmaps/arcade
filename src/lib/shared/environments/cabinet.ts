import type { ArcadeEnvironment, Buttons } from '$lib/shared/types.js'

export default class CabinetEnvironment implements ArcadeEnvironment {
  annotationUrls: string[] = []
  fetched = false

  getButtons(): Buttons {
    return [
      { keyCode: 'KeyZ', bgClass: 'bg-white' },
      { keyCode: 'KeyX', bgClass: 'bg-yellow' },
      { keyCode: 'KeyC', bgClass: 'bg-yellow' },
      { keyCode: 'KeyV', bgClass: 'bg-green' }
    ]
  }

  getButton(index: number) {
    return this.getButtons()[index]
  }

  async getAnnotationUrls() {
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

  async getRandomAnnotationUrl(previousAnnotationUrls: string[]) {
    if (!this.fetched) {
      await this.getAnnotationUrls()
    }

    const filteredAnnotationUrls = this.annotationUrls.filter(
      (annotationUrl) => !previousAnnotationUrls.includes(annotationUrl)
    )
    return filteredAnnotationUrls[Math.floor(Math.random() * filteredAnnotationUrls.length)]
  }
}
