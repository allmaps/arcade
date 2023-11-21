export function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches
}
