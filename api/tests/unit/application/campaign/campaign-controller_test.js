import { campaignController } from '../../../../lib/application/campaigns/campaign-controller.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../src/prescription/campaign/domain/usecases/index.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';
import { catchErr, expect, hFake, sinon } from '../../../test-helper.js';

const { FRENCH_SPOKEN } = LOCALE;

describe('Unit | Application | Controller | Campaign', function () {
  describe('#getAnalysis', function () {
    const campaignId = 1;
    const userId = 1;
    const locale = FRENCH_SPOKEN;
    let campaignAnalysisSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'computeCampaignAnalysis');
      campaignAnalysisSerializerStub = {
        serialize: sinon.stub(),
      };
    });

    it('should return expected results', async function () {
      // given
      const campaignAnalysis = Symbol('campaignAnalysis');
      const expectedResults = Symbol('results');
      usecases.computeCampaignAnalysis.withArgs({ userId, campaignId, locale }).resolves(campaignAnalysis);
      campaignAnalysisSerializerStub.serialize.withArgs(campaignAnalysis).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { id: campaignId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignController.getAnalysis(request, hFake, {
        campaignAnalysisSerializer: campaignAnalysisSerializerStub,
      });

      // then
      expect(response).to.equal(expectedResults);
    });

    it('should return an unauthorized error', async function () {
      // given
      const error = new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign');
      const request = {
        params: { id: campaignId },
        auth: {
          credentials: { userId },
        },
      };
      usecases.computeCampaignAnalysis.rejects(error);

      // when
      const errorCatched = await catchErr(campaignController.getAnalysis)(request);

      // then
      expect(errorCatched).to.be.instanceof(UserNotAuthorizedToAccessEntityError);
    });
  });
});
