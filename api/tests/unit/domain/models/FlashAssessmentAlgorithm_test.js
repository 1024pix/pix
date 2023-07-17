import { FlashAssessmentAlgorithm } from '../../../../lib/domain/models/index.js';
import { domainBuilder, expect } from '../../../test-helper.js';
import { AssessmentEndedError } from '../../../../lib/domain/errors.js';

describe('FlashAssessmentAlgorithm', function () {
  describe('#getPossibleNextChallenges', function () {
    context('when enough challenges have been answered', function () {
      it('should throw an AssessmentEndedError', function () {
        const allAnswers = [domainBuilder.buildAnswer({ id: 1 }), domainBuilder.buildAnswer({ id: 2 })];
        const skill1 = domainBuilder.buildSkill({ id: 1 });
        const skill2 = domainBuilder.buildSkill({ id: 2 });
        const challenges = [
          domainBuilder.buildChallenge({ id: allAnswers[0].challengeId, skill: skill1 }),
          domainBuilder.buildChallenge({ competenceId: 'comp2', skill: skill2 }),
        ];
        const estimatedLevel = 0;
        const algorithm = new FlashAssessmentAlgorithm({
          maximumAssessmentLength: 2,
        });

        expect(() =>
          algorithm.getPossibleNextChallenges({
            allAnswers,
            challenges,
            estimatedLevel,
          }),
        ).to.throw(AssessmentEndedError);
      });
    });
  });
});
