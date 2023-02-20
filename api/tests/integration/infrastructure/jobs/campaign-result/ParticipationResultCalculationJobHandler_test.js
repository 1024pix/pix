import { expect, sinon } from '../../../../test-helper';
import CampaignParticipationResultsShared from '../../../../../lib/domain/events/CampaignParticipationResultsShared';
import ParticipationResultCalculationJobHandler from '../../../../../lib/infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler';

describe('Integration | Infrastructure | Jobs | CampaignResult | ParticipationResultCalculation', function () {
  describe('#handle', function () {
    it('compute results', async function () {
      // given
      const event = new CampaignParticipationResultsShared({ campaignParticipationId: 1 });
      const participationResultsShared = Symbol('participation results shared');
      const participantResultsSharedRepository = { get: sinon.stub(), save: sinon.stub() };
      const handler = new ParticipationResultCalculationJobHandler({
        participantResultsSharedRepository,
      });
      participantResultsSharedRepository.get.withArgs(1).resolves(participationResultsShared);

      // when
      await handler.handle(event);

      // then
      expect(participantResultsSharedRepository.save).to.have.been.calledWith(participationResultsShared);
    });
  });
});
