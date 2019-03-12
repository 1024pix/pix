const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getCampaignParticipation = require('../../../../lib/domain/usecases/get-campaign-participation');

describe('Unit | UseCase | get-campaign-participation', () => {

  const options = {};

  let campaignParticipationRepository;

  beforeEach(() => {
    campaignParticipationRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the campaignParticipation', async () => {
    // given
    const campaignParticipationId = 1;
    const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId });
    campaignParticipationRepository.get.withArgs(campaignParticipationId, options).resolves(campaignParticipation);

    // when
    const result = await getCampaignParticipation({ campaignParticipationId, options, campaignParticipationRepository });

    // then
    expect(result).to.equal(campaignParticipation);
  });
});
