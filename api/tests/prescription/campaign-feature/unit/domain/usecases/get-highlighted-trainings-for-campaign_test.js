import { expect } from 'chai';
import * as sinon from 'sinon';

import { getHighlightedTrainingsForCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/get-highlighted-trainings-for-campaign.js';

describe('Unit | Prescription | Domain | Usecases | getHighlightedTrainingsForCampaign', function () {
  it('calls the repository with the campaignId and returns its result', async function () {
    // given
    const campaignId = 123;
    const highlightedTrainingsIds = ['training-1', 'training-2'];
    const campaignFeatureRepository = {
      getHighlightedTrainingsForCampaign: sinon.stub().resolves(highlightedTrainingsIds),
    };

    // when
    const result = await getHighlightedTrainingsForCampaign({ campaignId, campaignFeatureRepository });

    // then
    expect(campaignFeatureRepository.getHighlightedTrainingsForCampaign).to.have.been.calledOnceWith({ campaignId });
    expect(result).to.deep.equal(highlightedTrainingsIds);
  });
});
