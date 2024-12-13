import { ParticipationCompletedJobController } from '../../../../../../src/prescription/campaign-participation/application/jobs/participation-completed-job-controller.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | participationCompletedJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'sendCompletedParticipationResultsToPoleEmploi');
      // given
      const handler = new ParticipationCompletedJobController();
      const data = {
        campaignParticipationId: Symbol('campaignParticipationId'),
      };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.sendCompletedParticipationResultsToPoleEmploi).to.have.been.calledOnce;
      expect(usecases.sendCompletedParticipationResultsToPoleEmploi).to.have.been.calledWithExactly({
        campaignParticipationId: data.campaignParticipationId,
      });
    });
  });
});
