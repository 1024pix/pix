import { CampaignParticipationResultsShared } from '../../../../../../lib/domain/events/CampaignParticipationResultsShared.js';
import { SendSharedParticipationResultsToPoleEmploiHandler } from '../../../../../../lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Infrastructure | Jobs | SendSharedParticipationResultsToPoleEmploiHandler', function () {
  let event;

  context('#handle', function () {
    let campaignParticipationId;

    beforeEach(function () {
      campaignParticipationId = 55667788;
      event = new CampaignParticipationResultsShared({ campaignParticipationId });
    });

    it('should call the usecases', async function () {
      // given
      sinon.stub(usecases, 'sendSharedParticipationResultsToPoleEmploi');

      const sendSharedParticipationResultsToPoleEmploiHandler = new SendSharedParticipationResultsToPoleEmploiHandler();

      // when
      await sendSharedParticipationResultsToPoleEmploiHandler.handle(event);

      // then
      expect(usecases.sendSharedParticipationResultsToPoleEmploi).to.have.been.calledWithExactly({
        campaignParticipationId,
      });
    });
  });
});
