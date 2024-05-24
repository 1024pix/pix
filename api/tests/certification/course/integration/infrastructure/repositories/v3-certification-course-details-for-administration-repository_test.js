import * as v3CertificationCourseDetailsForAdministrationRepository from '../../../../../../src/certification/course/infrastructure/repositories/v3-certification-course-details-for-administration-repository.js';
import { ABORT_REASONS } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { AnswerStatus } from '../../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | v3-certification-course-details-for-administration', function () {
  describe('#getV3DetailsByCertificationCourseId', function () {
    it('should return all challenges by certification course id and last assessment result', async function () {
      // given
      const certificationCourseId = 123;
      const challengeId = 'recCHAL456';
      const assessmentId = 78;
      const isRejectedForFraud = true;
      const createdAt = new Date('2022-02-02');
      const flashAlgorithmConfigurationCreationDate = new Date('2022-02-01');
      const completedAt = new Date('2022-02-03');
      const assessmentState = Assessment.states.ENDED_DUE_TO_FINALIZATION;
      const assessmentResultStatus = AssessmentResult.status.VALIDATED;
      const abortReason = ABORT_REASONS.CANDIDATE;
      const pixScore = 60;
      const isCancelled = false;

      databaseBuilder.factory.buildCertificationCourse({
        id: certificationCourseId,
        isRejectedForFraud,
        createdAt,
        completedAt,
        abortReason,
        isCancelled,
      });
      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId,
      });
      databaseBuilder.factory.buildAssessment({
        id: assessmentId,
        certificationCourseId,
        state: assessmentState,
      });

      databaseBuilder.factory.buildAssessmentResult({
        pixScore: 50,
        certificationCourseId,
        assessmentId,
        assessmentResultStatus,
        createdAt: new Date('2020-01-01'),
      });

      const lastAssessmentResultId = databaseBuilder.factory.buildAssessmentResult({
        pixScore,
        certificationCourseId,
        assessmentId,
        assessmentResultStatus,
        createdAt: new Date('2024-01-01'),
      }).id;

      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId,
        lastAssessmentResultId,
      });

      const { maximumAssessmentLength: numberOfChallenges } = databaseBuilder.factory.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 1,
        createdAt: flashAlgorithmConfigurationCreationDate,
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
        isRejectedForFraud,
        createdAt,
        completedAt,
        assessmentState,
        assessmentResultStatus,
        abortReason,
        pixScore,
        isCancelled,
        numberOfChallenges,
        certificationChallengesForAdministration: [certificationChallengeForAdministration],
      });

      expect(certificationChallenges).to.deep.equal(expectedCertificationCourseDetails);
    });

    it('should return only validated live alerts', async function () {
      // given
      const certificationCourseId = 123;
      const firstChallengeId = 'recCHAL456';
      const secondChallengeId = 'recCHAL789';
      const thirdChallengeId = 'recCHAL123';
      const flashAlgorithmConfigurationCreationDate = new Date('2020-01-01');
      const assessmentId = 78;

      databaseBuilder.factory.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 3,
        createdAt: flashAlgorithmConfigurationCreationDate,
      });

      databaseBuilder.factory.buildCertificationCourse({ id: certificationCourseId });
      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId: firstChallengeId,
        createdAt: new Date('2020-01-01T17:00:00Z'),
      });

      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId: secondChallengeId,
        createdAt: new Date('2020-01-01T17:03:00Z'),
      });

      databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourseId,
        challengeId: thirdChallengeId,
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
        questionNumber: 1,
      }).id;

      const secondValidatedLiveAlertId = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId: secondChallengeId,
        status: 'validated',
        questionNumber: 1,
      }).id;

      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId,
        category: CertificationIssueReportCategory.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
        questionNumber: 1,
        liveAlertId: firstValidatedLiveAlertId,
      });

      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId,
        category: CertificationIssueReportCategory.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
        questionNumber: 1,
        liveAlertId: secondValidatedLiveAlertId,
      });

      databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId: firstChallengeId,
        status: 'rejected',
      });

      const thirdValidatedLiveAlertId = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId: thirdChallengeId,
        status: 'validated',
        questionNumber: 2,
      }).id;

      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId,
        category: CertificationIssueReportCategory.IN_CHALLENGE,
        subcategory: CertificationIssueReportSubcategories.ACCESSIBILITY_ISSUE,
        questionNumber: 2,
        liveAlertId: thirdValidatedLiveAlertId,
      });

      await databaseBuilder.commit();

      // when
      const certificationChallenges =
        await v3CertificationCourseDetailsForAdministrationRepository.getV3DetailsByCertificationCourseId({
          certificationCourseId,
        });

      // then
      const firstValidatedLiveAlert = domainBuilder.buildV3CertificationChallengeLiveAlertForAdministration({
        id: firstValidatedLiveAlertId,
        issueReportSubcategory: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
      });

      const secondValidatedLiveAlert = domainBuilder.buildV3CertificationChallengeLiveAlertForAdministration({
        id: secondValidatedLiveAlertId,
        issueReportSubcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
      });

      const thirdValidatedLiveAlert = domainBuilder.buildV3CertificationChallengeLiveAlertForAdministration({
        id: thirdValidatedLiveAlertId,
        issueReportSubcategory: CertificationIssueReportSubcategories.ACCESSIBILITY_ISSUE,
      });

      const firstCertificationChallengeForAdministration = domainBuilder.buildV3CertificationChallengeForAdministration(
        {
          challengeId: firstChallengeId,
          validatedLiveAlert: firstValidatedLiveAlert,
          competenceId: certificationChallenges.certificationChallengesForAdministration[0].competenceId,
          skillName: certificationChallenges.certificationChallengesForAdministration[0].skillName,
        },
      );

      const secondCertificationChallengeForAdministration =
        domainBuilder.buildV3CertificationChallengeForAdministration({
          challengeId: secondChallengeId,
          validatedLiveAlert: secondValidatedLiveAlert,
          competenceId: certificationChallenges.certificationChallengesForAdministration[1].competenceId,
          skillName: certificationChallenges.certificationChallengesForAdministration[1].skillName,
        });

      const thirdCertificationChallengeForAdministration = domainBuilder.buildV3CertificationChallengeForAdministration(
        {
          challengeId: thirdChallengeId,
          validatedLiveAlert: thirdValidatedLiveAlert,
          competenceId: certificationChallenges.certificationChallengesForAdministration[2].competenceId,
          skillName: certificationChallenges.certificationChallengesForAdministration[2].skillName,
        },
      );

      const expectedCertificationChallengesForAdministration = [
        firstCertificationChallengeForAdministration,
        secondCertificationChallengeForAdministration,
        thirdCertificationChallengeForAdministration,
      ];
      expect(certificationChallenges.certificationChallengesForAdministration).to.deep.equal(
        expectedCertificationChallengesForAdministration,
      );
    });
  });
});
