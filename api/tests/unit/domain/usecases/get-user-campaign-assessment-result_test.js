const { expect, sinon, domainBuilder } = require('../../../test-helper');
const getByUserIdAndCampaignId = require('../../../../lib/domain/usecases/get-user-campaign-assessment-result');

describe('Unit | UseCase | get-user-campaign-assessment-result', () => {

  let participantResultRepository;
  beforeEach(() => {
    participantResultRepository = { getByUserIdAndCampaignId: sinon.stub() };
  });

  it('should get the participant result', async () => {
    const userId = domainBuilder.buildUser().id;
    const campaignId = domainBuilder.buildCampaign().id;
    const locale = 'FR';
    const results = Symbol();

    participantResultRepository.getByUserIdAndCampaignId.withArgs({ userId, campaignId, locale }).resolves(results);

    const actualCampaignParticipationResult = await getByUserIdAndCampaignId({
      userId,
      campaignId,
      locale,
      participantResultRepository,
    });

    expect(actualCampaignParticipationResult).to.deep.equal(results);
  });
});
