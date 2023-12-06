import { sinon, expect, hFake } from '../../../../test-helper.js';
import { campaignDetailController } from '../../../../../src/prescription/campaign/application/campaign-detail-controller.js';
import { usecases } from '../../../../../src/prescription/campaign//domain/usecases/index.js';

describe('Unit | Application | Controller | Campaign', function () {
  describe('#getById', function () {
    const campaignId = 1;
    const userId = 1;

    let request, campaign;
    let campaignReportSerializerStub;
    let queryParamsUtilsStub;
    let tokenServiceStub;

    beforeEach(function () {
      campaign = {
        id: 1,
        name: 'My campaign',
      };
      request = {
        params: {
          id: campaign.id,
        },
        auth: {
          credentials: {
            userId: 1,
          },
        },
        query: {},
      };

      sinon.stub(usecases, 'getCampaign');
      campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      queryParamsUtilsStub = { extractParameters: sinon.stub() };
      tokenServiceStub = { createTokenForCampaignResults: sinon.stub().returns('token') };
      queryParamsUtilsStub.extractParameters.withArgs({}).returns({});
      usecases.getCampaign.resolves(campaign);
    });

    it('should return the campaign', async function () {
      // given
      const expectedResult = Symbol('ok');
      const tokenForCampaignResults = 'token';
      campaignReportSerializerStub.serialize
        .withArgs(campaign, {}, { tokenForCampaignResults })
        .returns(expectedResult);

      const dependencies = {
        campaignReportSerializer: campaignReportSerializerStub,
        queryParamsUtils: queryParamsUtilsStub,
        tokenService: tokenServiceStub,
      };
      // when
      const response = await campaignDetailController.getById(request, hFake, dependencies);

      // then
      expect(usecases.getCampaign).calledWith({ campaignId, userId });
      expect(tokenServiceStub.createTokenForCampaignResults).to.have.been.calledWithExactly({ userId, campaignId });
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
