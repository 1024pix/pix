import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import * as certificationCompanionAlertRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/certification-companion-alert-repository.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

const { createCompanionAlert } = usecases;

describe('Certification | Evaluation | Integration | Domain | UseCase | create-companion-alert', function () {
  it('should create an alert', async function () {
    // given
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    await databaseBuilder.commit();

    // when
    await createCompanionAlert({
      assessmentId,
      certificationCompanionAlertRepository,
    });

    // then
    const companionAlert = await knex('certification-companion-live-alerts').select('status', 'assessmentId');
    expect(companionAlert).to.deep.equal([{ status: CertificationCompanionLiveAlertStatus.ONGOING, assessmentId }]);
  });

  describe('when an ongoing alert already exists for assessment', function () {
    it('should NOT create an alert', async function () {
      // given
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
      databaseBuilder.factory.buildCertificationCompanionLiveAlert({ assessmentId });
      await databaseBuilder.commit();

      // when
      await createCompanionAlert({
        assessmentId,
        certificationCompanionAlertRepository,
      });

      // then
      const companionAlert = await knex('certification-companion-live-alerts').select('status', 'assessmentId');
      expect(companionAlert).to.deep.equal([{ status: CertificationCompanionLiveAlertStatus.ONGOING, assessmentId }]);
    });
  });
});
