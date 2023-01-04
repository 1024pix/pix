const { expect, sinon } = require('../../../../test-helper');
const CampaignParticipationResultsShared = require('../../../../../lib/domain/events/CampaignParticipationResultsShared');
const usecases = require('../../../../../lib/domain/usecases');
const ParticipationResultCalculationJobHandler = require('../../../../../lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler');

describe('Unit | Infrastructure | Jobs | saveComputedCampaignParticipationResult', function () {
  context('#handle', function () {
    it('should call the usecases', async function () {
      // given
      sinon.stub(usecases, 'saveComputedCampaignParticipationResult');
      const campaignParticipationId = 55667788;
      const event = new CampaignParticipationResultsShared({ campaignParticipationId });

      const participationResultCalculationJobHandler = new ParticipationResultCalculationJobHandler();

      // when
      await participationResultCalculationJobHandler.handle(event);

      // then
      expect(usecases.saveComputedCampaignParticipationResult).to.have.been.calledWith({ campaignParticipationId });
    });
  });
});
