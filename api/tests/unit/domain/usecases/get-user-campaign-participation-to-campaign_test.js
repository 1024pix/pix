const { expect, sinon } = require('../../../test-helper');
const getUserCampaignParticipationToCampaign = require('../../../../lib/domain/usecases/get-user-campaign-participation-to-campaign');

describe('Unit | UseCase | get-user-campaign-participation-to-campaign', () => {

  const userId = Symbol('user id');
  const campaignId = Symbol('campaign id');
  const expectedCampaignParticipation = Symbol('campaign participation');

  const campaignParticipationRepository = { findOneByCampaignIdAndUserId: sinon.stub() };

  it('should return the campaign participation', async () => {
    // given
    campaignParticipationRepository.findOneByCampaignIdAndUserId.withArgs({ userId, campaignId }).resolves(expectedCampaignParticipation);

    // when
    const campaignParticipation = await getUserCampaignParticipationToCampaign({ userId, campaignId, campaignParticipationRepository });

    // then
    expect(campaignParticipation).to.deep.equal(expectedCampaignParticipation);
  });
});
