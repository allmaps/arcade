import { assign } from 'xstate'

import type {
  EventObject,
  MachineContext,
  AnyEventObject,
  ParameterizedObject,
  AssignAction,
  ProvidedActor
} from 'xstate'

import type { Round } from '$lib/shared/types.js'

export function assignLastRound<
  TContext extends MachineContext,
  TExpressionEvent extends AnyEventObject = AnyEventObject,
  TParams extends ParameterizedObject['params'] | undefined =
    | ParameterizedObject['params']
    | undefined,
  TEvent extends EventObject = EventObject,
  TActor extends ProvidedActor = ProvidedActor
>(
  updateFn: (round: Round, event: TExpressionEvent, context: TContext) => Round
): AssignAction<TContext, TExpressionEvent, TParams, TEvent, TActor> {
  return assign<TContext, TExpressionEvent, TParams, TEvent, TActor>({
    rounds: ({ context, event }: { context: TContext; event: TExpressionEvent }) => {
      const lastRoundIndex = context.rounds.length - 1
      let lastRound = context.rounds[context.rounds.length - 1]
      lastRound = updateFn(lastRound, event, context)
      context.rounds[lastRoundIndex] = lastRound
      return context.rounds
    }
  })
}
