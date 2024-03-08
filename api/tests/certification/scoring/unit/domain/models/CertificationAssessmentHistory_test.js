import { CertificationAssessmentHistory } from '../../../../../../src/certification/scoring/domain/models/CertificationAssessmentHistory.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CertificationAssessmentHistory', function () {
  describe('#fromChallengesAndAnswers', function () {
    it('should return a CertificationAssessmentHistory with the capacity history', function () {
      // given
      const algorithm = {
        getEstimatedLevelAndErrorRateHistory: sinon.stub(),
      };

      const challenges = [
        domainBuilder.buildCertificationChallengeForScoring({
          id: 'challenge1',
          certificationChallengeId: 'certificationChallengeId1',
        }),
        domainBuilder.buildCertificationChallengeForScoring({
          id: 'challenge2',
          certificationChallengeId: 'certificationChallengeId2',
        }),
        domainBuilder.buildCertificationChallengeForScoring({
          id: 'challenge3',
          certificationChallengeId: 'certificationChallengeId3',
        }),
      ];
      const allAnswers = [
        domainBuilder.buildAnswer({ challengeId: 'challenge1', value: 'answer1' }),
        domainBuilder.buildAnswer({ challengeId: 'challenge2', value: 'answer1' }),
        domainBuilder.buildAnswer({ challengeId: 'challenge3', value: 'answer1' }),
      ];

      algorithm.getEstimatedLevelAndErrorRateHistory
        .withArgs({
          allAnswers,
          challenges,
        })
        .returns([{ estimatedLevel: 1 }, { estimatedLevel: 2 }, { estimatedLevel: 3 }]);

      // when
      const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
        algorithm,
        challenges,
        allAnswers,
      });

      // then
      const expectedCapacityHistory = [
        domainBuilder.buildCertificationChallengeCapacity({
          certificationChallengeId: 'certificationChallengeId1',
          capacity: 1,
        }),
        domainBuilder.buildCertificationChallengeCapacity({
          certificationChallengeId: 'certificationChallengeId2',
          capacity: 2,
        }),
        domainBuilder.buildCertificationChallengeCapacity({
          certificationChallengeId: 'certificationChallengeId3',
          capacity: 3,
        }),
      ];

      expect(certificationAssessmentHistory.capacityHistory).to.deep.equal(expectedCapacityHistory);
    });
  });
});
