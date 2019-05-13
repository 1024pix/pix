const { sinon, expect, hFake } = require('../../../test-helper');
const campaignCollectiveResultsController = require('../../../../lib/application/campaign-collective-results/campaign-collective-results-controller');
const serializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | Controller | campaign-collective-results-controller', () => {

  describe('#get ', () => {

    const campaignId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'computeCampaignCollectiveResult');
      sinon.stub(serializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.computeCampaignCollectiveResult.resolves({});
      serializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignCollectiveResultsController.get({
        params: { id: campaignId },
        auth: {
          credentials: { userId }
        }
      });

      // then
      expect(response).to.be.equal('ok');
    });

    it('should return an unauthorized error', async () => {
      // given
      const error = new UserNotAuthorizedToAccessEntity('User does not have access to this campaign participation');
      const request = {
        params: { id: campaignId },
        auth: {
          credentials: { userId }
        }
      };
      usecases.computeCampaignCollectiveResult.rejects(error);

      // when
      const response = await campaignCollectiveResultsController.get(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(403);
      expect(response.source).to.be.equal('Error: User is not authorized to access ressource');
    });

    it('should return an error', async () => {
      // given
      const error = new Error('Traditional error');
      const request = {
        params: { id: campaignId },
        auth: {
          credentials: { userId }
        }
      };
      usecases.computeCampaignCollectiveResult.rejects(error);

      // when
      const response = await campaignCollectiveResultsController.get(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(400);
      expect(response.source).to.be.equal('Error: Traditional error');
    });
  });
});
