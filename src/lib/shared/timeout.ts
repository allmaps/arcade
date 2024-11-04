const DEFAULT_TIMEOUT_MS = parseInt(import.meta.env.ARCADE_FETCH_TIMEOUT) || 5000

export function getTimeoutSignal(timeoutMs = DEFAULT_TIMEOUT_MS) {
  return {
    signal: AbortSignal.timeout(timeoutMs)
  }
}
