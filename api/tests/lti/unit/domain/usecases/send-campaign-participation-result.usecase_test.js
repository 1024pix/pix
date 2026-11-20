import { expect } from 'chai';
import sinon from 'sinon';

import { CampaignParticipationResult } from '../../../../../src/lti/domain/models/CampaignParticipationResult.js';
import { sendCampaignParticipationResult } from '../../../../../src/lti/domain/usecases/send-campaign-participation-result.usecase.js';

describe('Unit | LTI | Domain | Usecases | sendCampaignParticipationResult', function () {
  it('retrieves the campaign participation result', async function () {
    // given
    const campaignId = 1;
    const campaignParticipationId = 2;
    const userId = 3;
    const expectedResult = new CampaignParticipationResult({ campaignParticipationId, masteryRate: 0.5 });
    const ltiCampaignParticipationRepository = {
      getCampaignParticipationResult: sinon.stub(),
    };
    ltiCampaignParticipationRepository.getCampaignParticipationResult
      .withArgs({ campaignParticipationId })
      .resolves(expectedResult);

    // when
    const result = await sendCampaignParticipationResult({
      campaignId,
      campaignParticipationId,
      userId,
      ltiCampaignParticipationRepository,
    });

    // then
    expect(result).to.equal(expectedResult);
  });
});
