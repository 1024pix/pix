const { sinon, expect } = require('../../../test-helper');
const campaignParticipationResultController = require('../../../../lib/application/campaign-participation-results/campaign-participation-result-controller');
const campaignParticipationRepository = require('../../../../lib/infrastructure/repositories/campaign-participation-repository');
const participantResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/participant-result-serializer');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | campaign-participation-result-controller', () => {
  describe('#get ', () => {

    const campaignParticipationId = 1;
    const campaignId = 2;
    const userId = 3;
    const locale = 'fr';
    const result = Symbol('result');

    beforeEach(() => {
      sinon.stub(usecases, 'getUserCampaignAssessmentResult');
      sinon.stub(campaignParticipationRepository, 'get');
      sinon.stub(participantResultSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.getUserCampaignAssessmentResult.withArgs({
        userId,
        campaignId,
        locale,
      }).resolves(result);
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ campaignId });
      participantResultSerializer.serialize.withArgs(result).returns('ok');

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
