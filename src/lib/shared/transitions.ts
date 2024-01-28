import { cubicOut, quintOut } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'

export type FlyAndScaleParams = {
  delay?: number
  duration?: number
  easing?: (t: number) => number
  y?: number
  start?: number
}

export type SlideDirection = 'up' | 'down' | 'left' | 'right'

export type SlideParams = {
  delay?: number
  duration?: number
  easing?: (t: number) => number
  direction?: SlideDirection
}

const defaultSlideParams = { delay: 0, duration: 400, direction: 'left', easing: quintOut }
const defaultFlyAndScaleParams = { delay: 0, y: -8, start: 0.95, duration: 200, easing: cubicOut }

export const flyAndScale = (node: Element, params?: FlyAndScaleParams): TransitionConfig => {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform
  const withDefaults = { ...defaultFlyAndScaleParams, ...params }

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA
    const [minB, maxB] = scaleB

    const percentage = (valueA - minA) / (maxA - minA)
    const valueB = percentage * (maxB - minB) + minB

    return valueB
  }

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str
      return str + `${key}:${style[key]};`
    }, '')
  }

  return {
    duration: withDefaults.duration ?? 200,
    delay: withDefaults.delay,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [withDefaults.y, 0])
      const scale = scaleConversion(t, [0, 1], [withDefaults.start, 1])

      return styleToString({
        transform: `${transform} translate3d(0, ${y}px, 0) scale(${scale})`,
        opacity: t
      })
    },
    easing: withDefaults.easing
  }
}

export function slide(node: Element, params?: SlideParams): TransitionConfig {
  const withDefaults = { ...defaultSlideParams, ...params }

  let css = (t: number) => `transform: translateX(-${(1 - t) * 100}%);`

  if (withDefaults.direction === 'right') {
    css = (t: number) => `transform: translateX(${(1 - t) * 100}%);`
  } else if (withDefaults.direction === 'down') {
    css = (t: number) => `transform: translateY(${(1 - t) * 100}%);`
  } else if (withDefaults.direction === 'up') {
    css = (t: number) => `transform: translateY(-${(1 - t) * 100}%);`
  }

  return {
    delay: withDefaults.delay,
    duration: withDefaults.duration ?? 200,
    easing: withDefaults.easing,
    css
  }
}
