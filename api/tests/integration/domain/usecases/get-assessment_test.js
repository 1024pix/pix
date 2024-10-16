import { getAssessment } from '../../../../lib/domain/usecases/get-assessment.js';
import {
  CertificationCompanionLiveAlert,
  CertificationCompanionLiveAlertStatus,
} from '../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import * as certificationChallengeLiveAlertRepository from '../../../../src/certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCompanionAlertRepository from '../../../../src/certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import { Assessment } from '../../../../src/shared/domain/models/index.js';
import * as assessmentRepository from '../../../../src/shared/infrastructure/repositories/assessment-repository.js';
import { databaseBuilder, expect } from '../../../test-helper.js';

describe('Integration | UseCases | get-assessment', function () {
  context('When the assessment is type CERTIFICATION', function () {
    context('When there are companion live alerts', function () {
      it('should attach them to the given assessment', async function () {
        // given
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.CERTIFICATION,
        });
        databaseBuilder.factory.buildCertificationCompanionLiveAlert({
          id: 6372,
          assessmentId,
          status: CertificationCompanionLiveAlertStatus.ONGOING,
        });
        databaseBuilder.factory.buildCertificationCompanionLiveAlert({
          id: 6890,
          assessmentId,
          status: CertificationCompanionLiveAlertStatus.CLEARED,
        });

        await databaseBuilder.commit();

        // when
        const assessment = await getAssessment({
          assessmentId,
          assessmentRepository,
          certificationChallengeLiveAlertRepository,
          certificationCompanionAlertRepository,
        });

        // then
        const expectedOngoingLiveAlert = new CertificationCompanionLiveAlert({
          id: 6372,
          assessmentId,
          status: CertificationCompanionLiveAlertStatus.ONGOING,
        });
        const expectedClearedLiveAlert = new CertificationCompanionLiveAlert({
          id: 6890,
          assessmentId,
          status: CertificationCompanionLiveAlertStatus.CLEARED,
        });
        expect(assessment.companionLiveAlerts).to.deep.have.members([
          expectedOngoingLiveAlert,
          expectedClearedLiveAlert,
        ]);
      });
    });

    context('When there are NO companion live alerts', function () {
      it('should attach empty array to the given assessment', async function () {
        // given
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.CERTIFICATION,
        });
        const { id: otherAssessmentId } = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.CERTIFICATION,
        });
        databaseBuilder.factory.buildCertificationCompanionLiveAlert({
          assessmentId: otherAssessmentId,
        });
        databaseBuilder.factory.buildCertificationCompanionLiveAlert({
          assessmentId: otherAssessmentId,
        });
        await databaseBuilder.commit();

        // when
        const assessment = await getAssessment({
          assessmentId,
          assessmentRepository,
          certificationChallengeLiveAlertRepository,
          certificationCompanionAlertRepository,
        });

        // then
        expect(assessment.companionLiveAlerts).to.deep.equal([]);
      });
    });
  });

  context('When the assessment is NOT type CERTIFICATION', function () {
    it('should NOT attach companion live alerts to the given assessment', async function () {
      // given
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.PREVIEW,
      });
      await databaseBuilder.commit();

      // when
      const assessment = await getAssessment({
        assessmentId,
        assessmentRepository,
      });

      // then
      expect(assessment.companionLiveAlerts).to.be.undefined;
    });
  });
});
