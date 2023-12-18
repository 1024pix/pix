import { expect, databaseBuilder, domainBuilder } from '../../../../../test-helper.js';
import * as v3CertificationCourseDetailsForAdministrationRepository from '../../../../../../src/certification/course/infrastructure/repositories/v3-certification-course-details-for-administration-repository.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';

describe('Integration | Infrastructure | Repository | v3-certification-course-details-for-administration', function () {
  describe('#getV3DetailsByCertificationCourseId', function () {
    it('should return all challenges by certification course id', async function () {
      // given
      const certificationCourseId = 123;
      const challengeId = 'recCHAL456';
      const assessmentId = 78;

      databaseBuilder.factory.buildCertificationCourse({ id: certificationCourseId });
      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId,
      });
      databaseBuilder.factory.buildAssessment({
        id: assessmentId,
        certificationCourseId,
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId,
        challengeId,
        result: 'ok',
      });
      await databaseBuilder.commit();

      // when
      const certificationChallenges =
        await v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
          certificationCourseId,
        });

      // then
      const certificationChallengeForAdministration = domainBuilder.buildV3CertificationChallengeForAdministration({
        challengeId,
        answerStatus: AnswerStatus.OK,
      });
      const expectedCertificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
        certificationCourseId,
        certificationChallengesForAdministration: [certificationChallengeForAdministration],
      });
      expect(certificationChallenges).to.deep.equal(expectedCertificationCourseDetails);
    });
  });
});
