import { computeBbox } from '@allmaps/stdlib'

export function pointsToPath(points: [number, number][], size: [number, number]) {
  const [width, height] = size
  const [minX, minY, maxX, maxY] = computeBbox(points)

  const scaleAndTranslateX = (x: number) => {
    const scaleX = width / (maxX - minX)
    const translateX = -minX * scaleX
    return x * scaleX + translateX
  }

  const scaleAndTranslateY = (y: number) => {
    const scaleY = height / (maxY - minY)
    const translateY = -minY * scaleY
    return y * scaleY + translateY
  }

  return points
    .map(([x, y]) => [scaleAndTranslateX(x), scaleAndTranslateY(y)])
    .map((point, index) => [
      index === 0 ? 'M' : 'L',
      ...point,
      index === points.length - 1 ? 'Z' : ''
    ])
    .flat()
    .join(' ')
}
