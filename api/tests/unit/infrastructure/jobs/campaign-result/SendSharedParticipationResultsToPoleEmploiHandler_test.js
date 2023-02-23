const { expect, sinon } = require('../../../../test-helper');
const CampaignParticipationResultsShared = require('../../../../../lib/domain/events/CampaignParticipationResultsShared');
const SendSharedParticipationResultsToPoleEmploiHandler = require('../../../../../lib/infrastructure/jobs/campaign-result/SendSharedParticipationResultsToPoleEmploiHandler');
const usecases = require('../../../../../lib/domain/usecases/index.js');

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
      expect(usecases.sendSharedParticipationResultsToPoleEmploi).to.have.been.calledWith({ campaignParticipationId });
    });
  });
});
