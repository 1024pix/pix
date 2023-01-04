const { expect, sinon } = require('../../../test-helper');
const saveComputedCampaignParticipationResult = require('../../../../lib/domain/usecases/save-computed-campaign-participation-result');

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
    expect(participantResultsSharedRepository.get).to.have.been.calledWith(1);
    expect(participantResultsSharedRepository.save).to.have.been.calledWith(participationResultsShared);
  });
});
