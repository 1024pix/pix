import pickChallengeService from '../../../../../../src/certification/evaluation/domain/services/pick-challenge-service.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Evaluation | Services | PickChallengeService', function () {
  describe('#getChallengePicker', function () {
    context('when given a 100% chance to pick the most discriminating challenge', function () {
      it('should return the most discriminating challenge', function () {
        // given
        const mostDiscriminatingChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
          discriminant: 5,
          difficulty: 1,
        });
        const otherChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
          discriminant: 2.5,
          difficulty: 1,
        });
        const lessDiscriminatingChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
          discriminant: 1,
          difficulty: 1,
        });
        const probabilityToPickMostDiscriminatingChallenge = 100;

        // When provided to the below tested function, and thanks to Fisher–Snedecor distribution used by the algorithm to select upcoming questions,
        // possible challenges are already ordered (in descending order) by the amount of necessary "information" (in which the discriminant plays an important role)
        // to evaluate the candidate.
        const possibleChallenges = [mostDiscriminatingChallenge, otherChallenge, lessDiscriminatingChallenge];

        // when
        const pickChallenge = pickChallengeService.getChallengePicker(probabilityToPickMostDiscriminatingChallenge);
        const challenge = pickChallenge({ possibleChallenges });

        // then
        expect(challenge).to.deep.equal(mostDiscriminatingChallenge);
      });
    });
  });
});
