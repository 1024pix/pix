import { databaseBuilder, domainBuilder, expect, knex } from '../../../test-helper.js';
import * as certificationChallengeLiveAlertRepository from '../../../../lib/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../lib/domain/models/CertificationChallengeLiveAlert.js';

const assessmentIdWithNoAlerts = 123;
const assessmentIdWithLiveAlert = 456;

describe('Integration | Repository | Certification Challenge Live Alert', function () {
  afterEach(async function () {
    await knex('certification-challenge-live-alerts').delete();
  });

  describe('#save', function () {
    it('should persist the alert for this specific certification live challenge in db', async function () {
      // given
      const challengeId = 'challenge-123';
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
        assessmentId,
        challengeId,
      });

      await databaseBuilder.commit();

      // when
      await certificationChallengeLiveAlertRepository.save({ certificationChallengeLiveAlert });

      // then
      const expectedSavedCertificationChallengeLiveAlert = await knex('certification-challenge-live-alerts').first();

      expect(expectedSavedCertificationChallengeLiveAlert.challengeId).to.equal(challengeId);
      expect(expectedSavedCertificationChallengeLiveAlert.assessmentId).to.equal(assessmentId);
      expect(expectedSavedCertificationChallengeLiveAlert.status).to.equal(
        CertificationChallengeLiveAlertStatus.ONGOING,
      );
    });
  });

  describe('getByAssessmentId', function () {
    describe('when no liveAlert is linked to the assessment id', function () {
      it('should return an empty array', async function () {
        const liveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId(assessmentIdWithNoAlerts);

        expect(liveAlerts).to.have.length(0);
      });
    });

    describe('when a liveAlert is linked to the assessment id', function () {
      it('should return an empty array', async function () {
        databaseBuilder.factory.buildAssessment({
          id: assessmentIdWithLiveAlert,
        });
        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessmentIdWithLiveAlert,
        });
        await databaseBuilder.commit();
        const liveAlerts = await certificationChallengeLiveAlertRepository.getByAssessmentId(assessmentIdWithLiveAlert);

        expect(liveAlerts).to.have.length(1);
      });
    });
  });
});
