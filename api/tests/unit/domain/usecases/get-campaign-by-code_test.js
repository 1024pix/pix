const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-by-code', () => {

  const campaignRepository = {};
  const campaignCode = 'QWERTY123';

  beforeEach(() => {
    campaignRepository.getByCode = sinon.stub();
  });

  it('should call the repository to retrieve the campaign with the given code', () => {
    // given
    campaignRepository.getByCode.resolves();

    // when
    const promise = usecases.getCampaignByCode({ code: campaignCode, campaignRepository });

    // then
    return promise.then(() => {
      expect(campaignRepository.getByCode).to.have.been.calledWith(campaignCode);
    });
  });

  it('should return the found campaign', () => {
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

  it('should return an error if no campaign found for the given code', () => {
    // given
    campaignRepository.getByCode.resolves(null);

    // when
    const promise = usecases.getCampaignByCode({ code: campaignCode, campaignRepository });

    // then
    return expect(promise).to.be.rejectedWith(NotFoundError);
  });

});
