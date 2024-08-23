import { usecases } from '../../../../../../lib/domain/usecases/index.js';
import { ParticipationResultCalculationJobController } from '../../../../../../src/prescription/campaign-participation/application/jobs/participation-result-calculation-job-controller.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | participationResultCalculationJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'saveComputedCampaignParticipationResult');
      // given
      const handler = new ParticipationResultCalculationJobController();
      const data = { campaignParticipationId: Symbol('campaignParticipationId') };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.saveComputedCampaignParticipationResult).to.have.been.calledOnce;
      expect(usecases.saveComputedCampaignParticipationResult).to.have.been.calledWithExactly(data);
    });
  });
});
