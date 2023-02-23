const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');

describe('Unit | UseCase | get-campaign-by-code', function () {
  const code = 'QWERTY123';
  const campaignToJoinRepository = {
    getByCode: () => {
      return;
    },
  };

  beforeEach(function () {
    sinon.stub(campaignToJoinRepository, 'getByCode');
  });

  it('should return the campaign to join', async function () {
    // given
    const campaignToJoin = Symbol('someCampaign');
    campaignToJoinRepository.getByCode.withArgs(code).resolves(campaignToJoin);

    // when
    const actualCampaignToJoin = await usecases.getCampaignByCode({
      code,
      campaignToJoinRepository,
    });

    // then
    expect(actualCampaignToJoin).to.deep.equal(campaignToJoin);
  });
});
