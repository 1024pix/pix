const { expect, sinon } = require('../../../test-helper');
const getCampaign = require('../../../../lib/domain/usecases/get-campaign');

describe('Unit | UseCase | get-campaign', () => {

  let campaign;
  let campaignRepository;

  beforeEach(() => {
    campaign = {
      id: 1,
      name: 'My campaign',
    };
    campaignRepository = {
      get: sinon.stub(),
    };
  });

  it('should get the campaign', () => {
    // given 
    const options = {};
    campaignRepository.get.withArgs(campaign.id, options).resolves(campaign);

    // when
    const promise = getCampaign({ campaignId: campaign.id, options, campaignRepository });

    // then
    return promise.then((resultCampaign) => {
      expect(resultCampaign.name).to.equal(campaign.name);
    });
  });

  it('should throw an error when the campaign could not be retrieved', () => {
    // given
    campaignRepository.get.withArgs(campaign.id).rejects();

    // when
    const promise = getCampaign({ campaignId: campaign.id, campaignRepository });

    // then
    return expect(promise).to.be.rejected;
  });

});
