import { Assessment } from '../models/Assessment.js';

const { REACHED, EXCEEDED, NOT_REACHED, PARTIALLY_REACHED } = Assessment.results;

export function computeGlobalResult(stepResults, dareResult) {
  if (dareResult === REACHED) {
    return EXCEEDED;
  }

  const lastStepResult = stepResults.at(-1);
  if (dareResult === NOT_REACHED || lastStepResult === REACHED) {
    return REACHED;
  }

  if (lastStepResult === NOT_REACHED && stepResults.length > 1) {
    return PARTIALLY_REACHED;
  }

  return NOT_REACHED;
}
