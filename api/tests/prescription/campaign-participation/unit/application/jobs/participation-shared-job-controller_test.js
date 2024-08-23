import { usecases } from '../../../../../../lib/domain/usecases/index.js';
import { ParticipationSharedJobController } from '../../../../../../src/prescription/campaign-participation/application/jobs/participation-shared-job-controller.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | participationSharedJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'sendSharedParticipationResultsToPoleEmploi');
      // given
      const handler = new ParticipationSharedJobController();
      const data = {
        campaignParticipationId: Symbol('campaignParticipationId'),
      };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.sendSharedParticipationResultsToPoleEmploi).to.have.been.calledOnce;
      expect(usecases.sendSharedParticipationResultsToPoleEmploi).to.have.been.calledWithExactly({
        campaignParticipationId: data.campaignParticipationId,
      });
    });
  });
});
