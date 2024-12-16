import { uniqBy } from 'lodash-es'

import { HighscoreSchema } from '$lib/shared/schemas.js'

import type { ArcadeEnvironment, ButtonType, Configuration, Highscore } from '$lib/shared/types.js'

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

  async getHighscores(): Promise<Highscore[]> {
    try {
      const highscores = JSON.parse(localStorage.getItem('highscores') || '[]')
      return HighscoreSchema.array().parse(highscores)
    } catch (err) {
      console.error('Error while parsing highscores from localStorage', err)
      return []
    }
  }

  async saveHighscore(highscore: Highscore): Promise<void> {
    const highscores = await this.getHighscores()

    // Add new highscore and sort by score
    const newHighscores = uniqBy([...highscores, highscore], 'id').toSorted(
      (a, b) => b.score - a.score
    )
    localStorage.setItem('highscores', JSON.stringify(newHighscores))
  }
}
