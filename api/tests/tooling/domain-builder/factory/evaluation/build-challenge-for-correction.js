import { ChallengeForCorrection } from '../../../../../src/evaluation/domain/models/ChallengeForCorrection.js';
import { buildSolution } from '../build-solution.js';
import { buildChallenge } from '../learning-content/build-challenge.js';

export const buildChallengeForCorrection = function ({
  id = 'foo id',
  format = 'foo format',
  type = buildChallenge.TYPES.QCM,
  proposals = 'foo proposals',
  focused = false,
  competenceId = 'foo competenceId',
  solution = 'foo solution',
  solutionToDisplay = 'foo solutionToDisplay',
  noValidationNeeded = false,
  hasEmbedInternalValidation = false,
  solutionAlgo = buildSolution(),
} = {}) {
  const coreChallenge = buildChallenge({
    id,
    solution,
    solutionToDisplay,
    proposals,
    type,
    focusable: focused,
    format,
    competenceId,
    noValidationNeeded,
    hasEmbedInternalValidation,
  });
  return new ChallengeForCorrection(coreChallenge, solutionAlgo);
};

buildChallengeForCorrection.TYPES = buildChallenge.TYPES;
