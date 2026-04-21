import sinon from 'sinon';

import { CertificationAssessmentHistory } from '../../../../../../src/certification/evaluation/domain/models/CertificationAssessmentHistory.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Models | CertificationAssessmentHistory', function () {
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
        domainBuilder.certification.evaluation.buildChallengeCalibration({
          id: 'challenge1',
          certificationChallengeId: 'certificationChallengeId1',
        }),
        domainBuilder.certification.evaluation.buildChallengeCalibration({
          id: 'challenge2',
          certificationChallengeId: 'certificationChallengeId2',
        }),
        domainBuilder.certification.evaluation.buildChallengeCalibration({
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
        domainBuilder.certification.evaluation.buildCertificationChallengeCapacity({
          answerId: firstAnswerId,
          certificationChallengeId: 'certificationChallengeId1',
          capacity: 1,
        }),
        domainBuilder.certification.evaluation.buildCertificationChallengeCapacity({
          answerId: secondAnswerId,
          certificationChallengeId: 'certificationChallengeId2',
          capacity: 2,
        }),
        domainBuilder.certification.evaluation.buildCertificationChallengeCapacity({
          answerId: thirdAnswerId,
          certificationChallengeId: 'certificationChallengeId3',
          capacity: 3,
        }),
      ];

      expect(certificationAssessmentHistory.capacityHistory).to.deep.equal(expectedCapacityHistory);
    });
  });
});
