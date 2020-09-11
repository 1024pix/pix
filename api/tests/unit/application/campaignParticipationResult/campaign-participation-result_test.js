const { sinon, expect } = require('../../../test-helper');
const campaignParticipationResultController = require('../../../../lib/application/campaignParticipationResults/campaign-participation-result-controller');
const campaignParticipationResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-result-serializer');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | campaign-participation-result-controller', () => {
  describe('#get ', () => {

    const campaignParticipationId = 1;
    const userId = 1;
    const locale = 'fr';

    beforeEach(() => {
      sinon.stub(usecases, 'getCampaignParticipationResult');
      sinon.stub(campaignParticipationResultSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.getCampaignParticipationResult.withArgs({
        campaignParticipationId,
        userId,
        locale,
      }).resolves({});
      campaignParticipationResultSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignParticipationResultController.get({
        params: { id: campaignParticipationId },
        auth: {
          credentials: { userId },
        },
        headers: { 'accept-language': locale },
      });

      // then
      expect(response).to.equal('ok');
    });

  });
});
