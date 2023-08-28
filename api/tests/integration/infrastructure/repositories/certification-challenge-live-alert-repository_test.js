import { databaseBuilder, domainBuilder, expect, knex } from '../../../test-helper.js';
import * as certificationChallengeLiveAlertRepository from '../../../../lib/infrastructure/repositories/certification-challenge-live-alert-repository.js';

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
    });
  });
});
