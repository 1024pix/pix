import { CampaignParticipationResultsShared } from '../../../../../lib/domain/events/CampaignParticipationResultsShared.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { SendSharedParticipationResultsToPoleEmploiHandler } from '../../../../../src/shared/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler.js';
import { expect, sinon } from '../../../../test-helper.js';

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
