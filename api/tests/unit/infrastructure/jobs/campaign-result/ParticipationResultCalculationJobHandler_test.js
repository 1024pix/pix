import { expect, sinon } from '../../../../test-helper.js';
import { CampaignParticipationResultsShared } from '../../../../../lib/domain/events/CampaignParticipationResultsShared.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { ParticipationResultCalculationJobHandler } from '../../../../../lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler.js';

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
