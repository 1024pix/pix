import { expect, sinon, domainBuilder } from '../../../test-helper';
import findCampaignParticipationsRelatedToUser from '../../../../lib/domain/usecases/find-latest-ongoing-user-campaign-participations';

describe('Unit | UseCase | find-latest-user-campaign-participations', function () {
  let userId;
  const campaignParticipationRepository = { findLatestOngoingByUserId: () => undefined };

  beforeEach(function () {
    sinon.stub(campaignParticipationRepository, 'findLatestOngoingByUserId');
  });

  it('should call findLatestOngoingByUserId to find all campaign-participations', async function () {
    // given
    userId = 1;
    campaignParticipationRepository.findLatestOngoingByUserId.resolves();

    // when
    await findCampaignParticipationsRelatedToUser({
      userId,
      campaignParticipationRepository,
    });

    // then
    expect(campaignParticipationRepository.findLatestOngoingByUserId).to.have.been.calledWith(userId);
  });

  it('should return user with his campaign participations', async function () {
    // given
    const campaignParticipation1 = campaignParticipationRepository.findLatestOngoingByUserId.resolves(
      domainBuilder.buildCampaignParticipation({ userId })
    );
    const campaignParticipation2 = campaignParticipationRepository.findLatestOngoingByUserId.resolves(
      domainBuilder.buildCampaignParticipation({ userId })
    );
    campaignParticipationRepository.findLatestOngoingByUserId.resolves([
      campaignParticipation1,
      campaignParticipation2,
    ]);

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
