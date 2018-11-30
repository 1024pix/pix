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
    // This has to be done separated from the stub declaration, see :
    // http://nikas.praninskas.com/javascript/2015/07/28/quickie-sinon-withargs-not-working/
    campaignRepository.get.withArgs(campaign.id).resolves(campaign);
  });

  it('should get the campaign', () => {
    // when
    const promise = getCampaign({ campaignId: campaign.id, campaignRepository });

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
