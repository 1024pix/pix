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

      const answer = databaseBuilder.factory.buildAnswer({
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
        answeredAt: answer.createdAt,
        answerValue: answer.value,
        competenceId: certificationChallenges.certificationChallengesForAdministration[0].competenceId,
        skillName: certificationChallenges.certificationChallengesForAdministration[0].skillName,
      });

      const expectedCertificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
        certificationCourseId,
        certificationChallengesForAdministration: [certificationChallengeForAdministration],
      });

      expect(certificationChallenges).to.deep.equal(expectedCertificationCourseDetails);
    });

    it('should return only validated live alerts', async function () {
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

      const answer = databaseBuilder.factory.buildAnswer({
        assessmentId,
        challengeId,
        result: 'ok',
      });

      const validatedLiveAlertId = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId,
        status: 'validated',
      }).id;

      databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId,
        status: 'rejected',
      });
      await databaseBuilder.commit();

      // when
      const certificationChallenges =
        await v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
          certificationCourseId,
        });

      // then
      const validatedLiveAlert = domainBuilder.buildV3CertificationChallengeLiveAlertForAdministration({
        id: validatedLiveAlertId,
      });

      const certificationChallengeForAdministration = domainBuilder.buildV3CertificationChallengeForAdministration({
        challengeId,
        answerStatus: AnswerStatus.OK,
        answerValue: answer.value,
        validatedLiveAlert,
        answeredAt: answer.createdAt,
        competenceId: certificationChallenges.certificationChallengesForAdministration[0].competenceId,
        skillName: certificationChallenges.certificationChallengesForAdministration[0].skillName,
      });

      const expectedCertificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
        certificationCourseId,
        certificationChallengesForAdministration: [certificationChallengeForAdministration],
      });
      expect(certificationChallenges).to.deep.equal(expectedCertificationCourseDetails);
    });
  });
});
