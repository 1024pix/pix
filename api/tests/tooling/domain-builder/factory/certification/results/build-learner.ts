import { Learner } from '../../../../../../src/certification/results/domain/models/Learner.ts';

export function buildLearner({ id = 123 }: { id: number }) {
  return new Learner({ id });
}
