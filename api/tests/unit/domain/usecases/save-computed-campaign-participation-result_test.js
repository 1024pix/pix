import { expect, sinon } from '../../../test-helper.js';
import { saveComputedCampaignParticipationResult } from '../../../../lib/domain/usecases/save-computed-campaign-participation-result.js';

describe('Unit | Domain | UseCases | SaveComputedCompaignParticipationResult', function () {
  it('should compute results and save', async function () {
    // given
    const participationResultsShared = Symbol('participation results shared');
    const participantResultsSharedRepository = {
      get: sinon.stub().resolves(participationResultsShared),
      save: sinon.stub(),
    };

    // when
    await saveComputedCampaignParticipationResult({
      participantResultsSharedRepository,
      campaignParticipationId: 1,
    });

    // then
    expect(participantResultsSharedRepository.get).to.have.been.calledWithExactly(1);
    expect(participantResultsSharedRepository.save).to.have.been.calledWithExactly(participationResultsShared);
  });
});
