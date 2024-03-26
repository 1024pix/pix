import { CertificationAssessmentHistory } from '../../../../../../src/certification/scoring/domain/models/CertificationAssessmentHistory.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Domain | Models | CertificationAssessmentHistory', function () {
  describe('#fromChallengesAndAnswers', function () {
    it('should return a CertificationAssessmentHistory with the capacity history', function () {
      // given
      const algorithm = {
        getCapacityAndErrorRateHistory: sinon.stub(),
      };
      const firstAnswerId = 123;
      const secondAnswerId = 456;
      const thirdAnswerId = 789;

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
        domainBuilder.buildAnswer({ id: firstAnswerId, challengeId: 'challenge1', value: 'answer1' }),
        domainBuilder.buildAnswer({ id: secondAnswerId, challengeId: 'challenge2', value: 'answer1' }),
        domainBuilder.buildAnswer({ id: thirdAnswerId, challengeId: 'challenge3', value: 'answer1' }),
      ];

      algorithm.getCapacityAndErrorRateHistory
        .withArgs({
          allAnswers,
          challenges,
        })
        .returns([
          { answerId: firstAnswerId, capacity: 1 },
          { answerId: secondAnswerId, capacity: 2 },
          { answerId: thirdAnswerId, capacity: 3 },
        ]);

      // when
      const certificationAssessmentHistory = CertificationAssessmentHistory.fromChallengesAndAnswers({
        algorithm,
        challenges,
        allAnswers,
      });

      // then
      const expectedCapacityHistory = [
        domainBuilder.buildCertificationChallengeCapacity({
          answerId: firstAnswerId,
          certificationChallengeId: 'certificationChallengeId1',
          capacity: 1,
        }),
        domainBuilder.buildCertificationChallengeCapacity({
          answerId: secondAnswerId,
          certificationChallengeId: 'certificationChallengeId2',
          capacity: 2,
        }),
        domainBuilder.buildCertificationChallengeCapacity({
          answerId: thirdAnswerId,
          certificationChallengeId: 'certificationChallengeId3',
          capacity: 3,
        }),
      ];

      expect(certificationAssessmentHistory.capacityHistory).to.deep.equal(expectedCapacityHistory);
    });
  });
});
