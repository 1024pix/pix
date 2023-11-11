import { databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';
import * as certificationChallengeLiveAlertRepository from '../../../../../../src/certification/session/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';
import _ from 'lodash';

const assessmentIdWithNoAlerts = 123;
const assessmentIdWithLiveAlert = 456;

describe('Integration | Repository | Certification Challenge Live Alert', function () {
  describe('#save', function () {
    it('should persist a non existing alert for this specific certification live challenge in db', async function () {
      // given
      const challengeId = 'challenge-123';
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const questionNumber = 2;
      const certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId,
        questionNumber,
      });

      await databaseBuilder.commit();

      // when
      await certificationChallengeLiveAlertRepository.save({ certificationChallengeLiveAlert });

      // then
      const expectedSavedCertificationChallengeLiveAlert = await knex('certification-challenge-live-alerts').first();

      expect(expectedSavedCertificationChallengeLiveAlert.challengeId).to.equal(challengeId);
      expect(expectedSavedCertificationChallengeLiveAlert.assessmentId).to.equal(assessmentId);
      expect(expectedSavedCertificationChallengeLiveAlert.questionNumber).to.equal(questionNumber);
      expect(expectedSavedCertificationChallengeLiveAlert.status).to.equal(
        CertificationChallengeLiveAlertStatus.ONGOING,
      );
    });

    it('should upate an existing alert for this specific certification live challenge in db', async function () {
      // given
      const challengeId = 'rec123';
      const assessment = databaseBuilder.factory.buildAssessment();
      const questionNumber = 2;
      const certificationChallengeLiveAlert = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
        assessmentId: assessment.id,
        questionNumber,
        challengeId,
      });
      const dismissedLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
        id: certificationChallengeLiveAlert.id,
        assessmentId: assessment.id,
        challengeId,
        status: CertificationChallengeLiveAlertStatus.DISMISSED,
        questionNumber,
        createdAt: certificationChallengeLiveAlert.createdAt,
        updatedAt: certificationChallengeLiveAlert.updatedAt,
      });

      await databaseBuilder.commit();

      // when
      await certificationChallengeLiveAlertRepository.save({ certificationChallengeLiveAlert: dismissedLiveAlert });

      // then
      const expectedSavedCertificationChallengeLiveAlert = await knex('certification-challenge-live-alerts').first();

      expect(expectedSavedCertificationChallengeLiveAlert.challengeId).to.equal(challengeId);
      expect(expectedSavedCertificationChallengeLiveAlert.assessmentId).to.equal(assessment.id);
      expect(expectedSavedCertificationChallengeLiveAlert.questionNumber).to.equal(questionNumber);
      expect(expectedSavedCertificationChallengeLiveAlert.status).to.equal(
        CertificationChallengeLiveAlertStatus.DISMISSED,
      );
    });
  });

  describe('getByAssessmentId', function () {
    describe('when no liveAlert is linked to the assessment id', function () {
      it('should return an empty array', async function () {
        // given / when
        const liveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId(assessmentIdWithNoAlerts);

        // then
        expect(liveAlerts).to.have.length(0);
      });
    });

    describe('when a liveAlert is linked to the assessment id', function () {
      it('should return an empty array', async function () {
        // given
        const questionNumber = 2;
        databaseBuilder.factory.buildAssessment({
          id: assessmentIdWithLiveAlert,
        });
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentIdWithLiveAlert,
          questionNumber,
        });
        await databaseBuilder.commit();

        // when
        const liveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId(assessmentIdWithLiveAlert);

        // then
        expect(liveAlerts).to.have.length(1);
        expect(_.pick(liveAlerts[0], ['questionNumber', 'assessmentId'])).to.deep.equal({
          questionNumber,
          assessmentId: assessmentIdWithLiveAlert,
        });
      });
    });
  });

  describe('getLiveAlertValidatedChallengeIdsByAssessmentId', function () {
    describe('when a validated liveAlert is linked to the assessment id', function () {
      it('should return a challenge ids array', async function () {
        // given
        const questionNumber = 2;
        databaseBuilder.factory.buildAssessment({
          id: assessmentIdWithLiveAlert,
        });
        const challengeId = databaseBuilder.factory.buildCertificationChallenge({
          assessmentIdWithLiveAlert,
        }).challengeId;
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentIdWithLiveAlert,
          questionNumber,
          status: CertificationChallengeLiveAlertStatus.VALIDATED,
          challengeId,
        });
        await databaseBuilder.commit();

        // when
        const liveAlertValidatedChallengeIds =
          await certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId(
            assessmentIdWithLiveAlert,
          );

        // then
        expect(liveAlertValidatedChallengeIds).to.deep.equal([challengeId]);
      });
    });

    describe('when no validated liveAlert is linked to the assessment id', function () {
      it('should return an empty array', async function () {
        // given
        const questionNumber = 2;
        databaseBuilder.factory.buildAssessment({
          id: assessmentIdWithLiveAlert,
        });
        const challengeId = databaseBuilder.factory.buildCertificationChallenge({ assessmentIdWithLiveAlert }).id;
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentIdWithLiveAlert,
          questionNumber,
          status: CertificationChallengeLiveAlertStatus.DISMISSED,
          challengeId,
        });
        await databaseBuilder.commit();

        // when
        const liveAlertValidatedChallengeIds =
          await certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId(
            assessmentIdWithLiveAlert,
          );

        // then
        expect(liveAlertValidatedChallengeIds).to.have.length(0);
      });
    });

    describe('when a dismissed liveAlert and a validated liveAlert is linked to the assessment id', function () {
      it('should return a challenge ids array', async function () {
        // given
        const questionNumber = 2;
        databaseBuilder.factory.buildAssessment({
          id: assessmentIdWithLiveAlert,
        });
        const challengeId = databaseBuilder.factory.buildCertificationChallenge({
          assessmentIdWithLiveAlert,
        }).challengeId;
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentIdWithLiveAlert,
          questionNumber,
          status: CertificationChallengeLiveAlertStatus.DISMISSED,
          challengeId,
        });
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentIdWithLiveAlert,
          questionNumber,
          status: CertificationChallengeLiveAlertStatus.VALIDATED,
          challengeId,
        });
        await databaseBuilder.commit();

        // when
        const liveAlertValidatedChallengeIds =
          await certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId(
            assessmentIdWithLiveAlert,
          );

        // then
        expect(liveAlertValidatedChallengeIds).to.deep.equal([challengeId]);
      });
    });
  });

  describe('getOngoingBySessionIdAndUserId', function () {
    const sessionId = 123;
    const userId = 456;
    describe('when there is no ongoing live alert', function () {
      it('should return null', async function () {
        // given / when
        const liveAlert = await certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId({
          sessionId,
          userId,
        });

        // then
        expect(liveAlert).to.be.null;
      });
    });

    describe('when there is an ongoing live alert', function () {
      it('should return the live alert', async function () {
        // given
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse();

        const assessment = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          userId: certificationCourse.userId,
        });

        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.DISMISSED,
        });

        const certificationChallengeLiveAlert = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.ONGOING,
        });

        await databaseBuilder.commit();

        // when
        const liveAlert = await certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId({
          sessionId: certificationCourse.sessionId,
          userId: certificationCourse.userId,
        });

        // then
        expect(liveAlert).to.deep.equal(certificationChallengeLiveAlert);
      });
    });
  });

  describe('getOngoingByChallengeIdAndAssessmentId', function () {
    const challengeId = 'rec123';
    const assessmentId = 456;

    describe('when there is no ongoing live alert', function () {
      it('should return null', async function () {
        // given / when
        const liveAlert = await certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId({
          challengeId,
          assessmentId,
        });

        // then
        expect(liveAlert).to.be.null;
      });
    });

    describe('when there is an ongoing live alert', function () {
      it('should return the live alert', async function () {
        // given
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse();

        const assessment = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          userId: certificationCourse.userId,
        });

        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.DISMISSED,
        });

        const certificationChallengeLiveAlert = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.ONGOING,
        });

        await databaseBuilder.commit();

        // when
        const liveAlert = await certificationChallengeLiveAlertRepository.getOngoingByChallengeIdAndAssessmentId({
          challengeId: certificationChallengeLiveAlert.challengeId,
          assessmentId: assessment.id,
        });

        // then
        expect(liveAlert).to.deep.equal(certificationChallengeLiveAlert);
      });
    });
  });
});
