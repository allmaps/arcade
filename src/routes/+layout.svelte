<script lang="ts">
  import { untrack } from 'svelte'

  import { useMachine } from '@xstate/svelte'

  import { gameMachine } from '$lib/shared/machines/game.js'

  import { setDeviceState } from '$lib/shared/stores/device.svelte.js'
  import { setSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { setFailedAnnotationUrlsState } from '$lib/shared/stores/failed-annotation-urls.svelte'
  import { setGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'
  import { setMapControlsState } from '$lib/shared/stores/map-controls.svelte.js'
  import { setTimerState } from '$lib/shared/stores/timer.svelte.js'

  import type { Snippet } from 'svelte'

  import type { LayoutData } from '$lib/shared/types.js'

  import '../app.css'
  import '../fonts.css'

  type Props = {
    data: LayoutData
    children?: Snippet
  }

  let { data, children }: Props = $props()
  // The game actor is initialized once for the lifetime of this layout.
  const { environment, configuration } = untrack(() => data)

  const failedAnnotationUrlsState = setFailedAnnotationUrlsState()
  const gameTimeoutState = setGameTimeoutState()
  setTimerState()
  setMapControlsState()

  const { snapshot, send, actorRef } = useMachine(gameMachine, {
    input: {
      environment,
      configuration,
      failedAnnotationUrlsState,
      gameTimeoutState
    }
  })

  setDeviceState()
  setSnapshotState(snapshot, send, actorRef)
</script>

{@render children?.()}
