const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-campaign-by-code', () => {

  const code = 'QWERTY123';
  const campaignToJoinRepository = { getByCode: () => {} };

  beforeEach(() => {
    sinon.stub(campaignToJoinRepository, 'getByCode');
  });

  it('should return the campaign to join', async () => {
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
