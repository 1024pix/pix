import sinon from 'sinon';

import { ParticipationStartedJobController } from '../../../../../../src/prescription/campaign-participation/application/jobs/participation-started-job-controller.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';

describe('Unit | Application | Controller | Jobs | participation-started-controller', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'sendStartedParticipationResultsToPoleEmploi');
      // given
      const handler = new ParticipationStartedJobController();
      const data = {
        campaignParticipationId: Symbol('campaignParticipationId'),
      };

      // when
      await handler.handle({ data });

      // then
      expect(usecases.sendStartedParticipationResultsToPoleEmploi).to.have.been.calledOnce;
      expect(usecases.sendStartedParticipationResultsToPoleEmploi).to.have.been.calledWithExactly({
        campaignParticipationId: data.campaignParticipationId,
      });
    });
  });
});
