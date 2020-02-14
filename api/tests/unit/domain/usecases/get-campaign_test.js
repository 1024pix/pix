const { expect, sinon, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getCampaign = require('../../../../lib/domain/usecases/get-campaign');

describe('Unit | UseCase | get-campaign', () => {

  let campaign;
  let campaignRepository;

  beforeEach(() => {
    campaign = {
      id: '1',
      name: 'My campaign',
    };
    campaignRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the campaign', async () => {
    // given
    const options = {};
    campaignRepository.get.withArgs(parseInt(campaign.id), options).resolves(campaign);

    // when
    const resultCampaign = await getCampaign({ campaignId: campaign.id, options, campaignRepository });

    // then
    expect(resultCampaign.name).to.equal(campaign.name);
  });

  it('should throw an error when the campaign could not be retrieved', () => {
    // given
    campaignRepository.get.withArgs(parseInt(campaign.id)).rejects();

    // when
    const promise = getCampaign({ campaignId: campaign.id, campaignRepository });

    // then
    return expect(promise).to.be.rejected;
  });

  it('should throw a Not found error when the campaign is searched with a not valid ID', async () => {
    // given
    const invalidCampaignId = 'abc';

    // when
    const error = await catchErr(getCampaign)({ campaignId: invalidCampaignId, campaignRepository });

    // then
    return expect(error).to.be.instanceOf(NotFoundError);
  });
});
