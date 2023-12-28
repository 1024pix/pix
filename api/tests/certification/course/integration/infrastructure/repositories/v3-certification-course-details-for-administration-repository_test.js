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
      const firstChallengeId = 'recCHAL456';
      const secondChallengeId = 'recCHAL789';
      const assessmentId = 78;

      databaseBuilder.factory.buildCertificationCourse({ id: certificationCourseId });
      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId: firstChallengeId,
        createdAt: new Date('2020-01-01T17:00:00Z'),
      });

      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId: secondChallengeId,
        createdAt: new Date('2020-01-01T17:05:00Z'),
      });

      databaseBuilder.factory.buildAssessment({
        id: assessmentId,
        certificationCourseId,
      });

      const firstValidatedLiveAlertId = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId: firstChallengeId,
        status: 'validated',
      }).id;

      databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId: firstChallengeId,
        status: 'rejected',
      });

      const secondValidatedLiveAlertId = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId: secondChallengeId,
        status: 'validated',
      }).id;
      await databaseBuilder.commit();

      // when
      const certificationChallenges =
        await v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
          certificationCourseId,
        });

      // then
      const firstValidatedLiveAlert = domainBuilder.buildV3CertificationChallengeLiveAlertForAdministration({
        id: firstValidatedLiveAlertId,
      });

      const secondValidatedLiveAlert = domainBuilder.buildV3CertificationChallengeLiveAlertForAdministration({
        id: secondValidatedLiveAlertId,
      });

      const firstCertificationChallengeForAdministration = domainBuilder.buildV3CertificationChallengeForAdministration(
        {
          challengeId: firstChallengeId,
          answerValue: null,
          answeredAt: null,
          answerStatus: null,
          validatedLiveAlert: firstValidatedLiveAlert,
          competenceId: certificationChallenges.certificationChallengesForAdministration[0].competenceId,
          skillName: certificationChallenges.certificationChallengesForAdministration[0].skillName,
        },
      );

      const secondCertificationChallengeForAdministration =
        domainBuilder.buildV3CertificationChallengeForAdministration({
          challengeId: secondChallengeId,
          answerValue: null,
          answeredAt: null,
          answerStatus: null,
          validatedLiveAlert: secondValidatedLiveAlert,
          competenceId: certificationChallenges.certificationChallengesForAdministration[1].competenceId,
          skillName: certificationChallenges.certificationChallengesForAdministration[1].skillName,
        });

      const expectedCertificationCourseDetails = domainBuilder.buildV3CertificationCourseDetailsForAdministration({
        certificationCourseId,
        certificationChallengesForAdministration: [
          firstCertificationChallengeForAdministration,
          secondCertificationChallengeForAdministration,
        ],
      });
      expect(certificationChallenges).to.deep.equal(expectedCertificationCourseDetails);
    });
  });
});
