const { expect, sinon, domainBuilder } = require('../../../test-helper');
const findCampaignParticipationsRelatedToUser = require('../../../../lib/domain/usecases/find-campaign-participations-related-to-user');

describe('Unit | UseCase | get-user-campaign-participations', () => {

  let userId;
  const campaignParticipationRepository = { findByUserId: () => undefined };

  beforeEach(() => {
    sinon.stub(campaignParticipationRepository, 'findByUserId');
  });

  it('should call findByUserId to find all campaign-participations', async () => {
    // given
    userId = 1;
    campaignParticipationRepository.findByUserId.resolves();

    // when
    await findCampaignParticipationsRelatedToUser({
      userId,
      campaignParticipationRepository,
    });

    // then
    expect(campaignParticipationRepository.findByUserId).to.have.been.calledWith(userId);
  });

  it('should return user with his campaign participations', async () => {
    // given
    const campaignParticipation1 = campaignParticipationRepository.findByUserId.resolves(domainBuilder.buildCampaignParticipation({ userId }));
    const campaignParticipation2 = campaignParticipationRepository.findByUserId.resolves(domainBuilder.buildCampaignParticipation({ userId }));
    campaignParticipationRepository.findByUserId.resolves([campaignParticipation1, campaignParticipation2]);

    // when
    const foundCampaignParticipations = await findCampaignParticipationsRelatedToUser({
      userId,
      campaignParticipationRepository,
    });

    // then
    expect(foundCampaignParticipations).to.be.an.instanceOf(Array);
    expect(foundCampaignParticipations).to.have.length(2);
    expect(foundCampaignParticipations[0]).to.equal(campaignParticipation1);
    expect(foundCampaignParticipations[1]).to.equal(campaignParticipation2);
  });
});
