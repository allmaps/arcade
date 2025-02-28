import { setContext, getContext } from 'svelte'

const DEVICE_KEY = Symbol('device')

export class DeviceState {
  #isTouch = $state(false)

  get isTouch() {
    return this.#isTouch
  }

  set isTouch(isTouch: boolean) {
    this.#isTouch = isTouch
  }
}

export function setDeviceState() {
  return setContext(DEVICE_KEY, new DeviceState())
}

export function getDeviceState() {
  const deviceState = getContext<ReturnType<typeof setDeviceState>>(DEVICE_KEY)

  if (!deviceState) {
    throw new Error('DeviceState is not set')
  }

  return deviceState
}
