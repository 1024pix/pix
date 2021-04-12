const { sinon, expect } = require('../../../test-helper');
const campaignParticipationResultController = require('../../../../lib/application/campaign-participation-results/campaign-participation-result-controller');
const participantResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/participant-result-serializer');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | campaign-participation-result-controller', () => {
  describe('#get ', () => {

    const campaignParticipationId = 1;
    const userId = 1;
    const locale = 'fr';

    beforeEach(() => {
      sinon.stub(usecases, 'getParticipantResult');
      sinon.stub(participantResultSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.getParticipantResult.withArgs({
        campaignParticipationId,
        userId,
        locale,
      }).resolves({});
      participantResultSerializer.serialize.withArgs({}).returns('ok');

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
