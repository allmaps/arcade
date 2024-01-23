import { red, yellow, darkblue, orange, green } from '@allmaps/tailwind'

import { parse, formatRgb } from 'culori'

function getConvexHullColor(color: string): string {
  const parsedColor = parse(color)

  if (parsedColor) {
    return formatRgb({ ...parsedColor, alpha: 0.3 })
  }

  return 'rgba(255, 255, 255, 0)'
}

export const colorForRounds = [
  {
    bgClass: 'bg-red',
    bgClassFaded: 'bg-red-200',
    textColor: 'text-black',
    color: red,
    convexHullColor: getConvexHullColor(red)
  },
  {
    bgClass: 'bg-yellow',
    bgClassFaded: 'bg-yellow-200',
    textColor: 'text-black',
    color: yellow,
    convexHullColor: getConvexHullColor(yellow)
  },
  {
    bgClass: 'bg-orange',
    bgClassFaded: 'bg-orange-200',
    textColor: 'text-black',
    color: orange,
    convexHullColor: getConvexHullColor(orange)
  },
  {
    bgClass: 'bg-green',
    bgClassFaded: 'bg-green-200',
    textColor: 'text-black',
    color: green,
    convexHullColor: getConvexHullColor(green)
  },
  {
    bgClass: 'bg-darkblue',
    bgClassFaded: 'bg-darkblue-200',
    textColor: 'text-white',
    color: darkblue,
    convexHullColor: getConvexHullColor(darkblue)
  }
]
