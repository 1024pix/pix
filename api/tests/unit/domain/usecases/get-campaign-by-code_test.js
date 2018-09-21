const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-campaign-by-code', () => {

  const campaignRepository = {};
  const campaignCode = 'QWERTY123';

  beforeEach(() => {
    campaignRepository.getByCode = sinon.stub();
  });

  it('should call the repository to retrieve the campaign with the given code', function() {
    // given
    campaignRepository.getByCode.resolves();

    // when
    const promise = usecases.getCampaignByCode({ code: campaignCode, campaignRepository });

    // then
    return promise.then(() => {
      expect(campaignRepository.getByCode).to.have.been.calledWith(campaignCode);
    });
  });

  it('should return the found campaign', function() {
    // given
    const campaignFound = factory.buildCampaign();
    campaignRepository.getByCode.resolves(campaignFound);

    // when
    const promise = usecases.getCampaignByCode({ code: campaignCode, campaignRepository });

    // then
    return promise.then((campaign) => {
      expect(campaign).to.deep.equal(campaignFound);
    });
  });

});
