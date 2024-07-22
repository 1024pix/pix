import { saveComputedCampaignParticipationResult } from '../../../../lib/domain/usecases/save-computed-campaign-participation-result.js';
import { CantCalculateCampaignParticipationResultError } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | UseCases | SaveComputedCompaignParticipationResult', function () {
  it('should throw an error if participation is not shared', async function () {
    // given
    const campaignParticipationRepository = {
      get: sinon.stub().resolves({ isShared: false }),
    };

    // when
    const error = await catchErr(saveComputedCampaignParticipationResult)({
      campaignParticipationRepository,
      campaignParticipationId: 1,
    });

    // then
    expect(error).to.be.instanceof(CantCalculateCampaignParticipationResultError);
  });

  it('should compute results and save', async function () {
    // given
    const participationResultsShared = Symbol('participation results shared');
    const participantResultsSharedRepository = {
      get: sinon.stub().resolves(participationResultsShared),
      save: sinon.stub(),
    };
    const campaignParticipationRepository = {
      get: sinon.stub().resolves({ isShared: true }),
    };

    // when
    await saveComputedCampaignParticipationResult({
      campaignParticipationRepository,
      participantResultsSharedRepository,
      campaignParticipationId: 1,
    });

    // then
    expect(participantResultsSharedRepository.get).to.have.been.calledWithExactly(1);
    expect(participantResultsSharedRepository.save).to.have.been.calledWithExactly(participationResultsShared);
  });
});
