import { usecases } from '../../../../../../lib/domain/usecases/index.js';
import { SendSharedParticipationResultsToPoleEmploiJobController } from '../../../../../../src/prescription/campaign-participation/application/jobs/send-share-participation-results-to-pole-emploi-job-controller.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Prescription | Application | Jobs | sendSharedParticipationResultsToPoleEmploiJobController', function () {
  describe('#handle', function () {
    it('should call usecase', async function () {
      sinon.stub(usecases, 'sendSharedParticipationResultsToPoleEmploi');
      // given
      const handler = new SendSharedParticipationResultsToPoleEmploiJobController();
      const sendSharedParticipationResultsToPoleEmploiJob = {
        campaignParticipationId: Symbol('campaignParticipationId'),
      };

      // when
      await handler.handle(sendSharedParticipationResultsToPoleEmploiJob);

      // then
      expect(usecases.sendSharedParticipationResultsToPoleEmploi).to.have.been.calledOnce;
      expect(usecases.sendSharedParticipationResultsToPoleEmploi).to.have.been.calledWithExactly(
        sendSharedParticipationResultsToPoleEmploiJob,
      );
    });
  });
});
