import { campaignResultsController } from '../../../../../src/prescription/campaign/application/campaign-results-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../src/shared/domain/errors.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { catchErr, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Campaign Results', function () {
  describe('#getCollectiveResult', function () {
    const campaignId = 1;
    const userId = 1;
    const locale = FRENCH_SPOKEN;
    let campaignCollectiveResultSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'computeCampaignCollectiveResult');
      campaignCollectiveResultSerializerStub = {
        serialize: sinon.stub(),
      };
    });

    it('should return expected results', async function () {
      // given
      const campaignCollectiveResult = Symbol('campaignCollectiveResults');
      const expectedResults = Symbol('results');
      usecases.computeCampaignCollectiveResult
        .withArgs({ userId, campaignId, locale })
        .resolves(campaignCollectiveResult);
      campaignCollectiveResultSerializerStub.serialize.withArgs(campaignCollectiveResult).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignResultsController.getCollectiveResult(request, hFake, {
        campaignCollectiveResultSerializer: campaignCollectiveResultSerializerStub,
      });

      // then
      expect(response).to.equal(expectedResults);
    });

    it('should return an unauthorized error', async function () {
      // given
      const error = new UserNotAuthorizedToAccessEntityError(
        'User does not have access to this campaign participation',
      );
      const request = {
        params: { campaignId },
        auth: {
          credentials: { userId },
        },
      };
      usecases.computeCampaignCollectiveResult.rejects(error);

      // when
      const errorCatched = await catchErr(campaignResultsController.getCollectiveResult)(request);

      // then
      expect(errorCatched).to.be.instanceof(UserNotAuthorizedToAccessEntityError);
    });
  });

  describe('#findAssessmentParticipationResults', function () {
    const campaignId = 1;
    const userId = 1;
    const locale = FRENCH_SPOKEN;
    let campaignAssessmentResultMinimalSerializer;
    let pageSymbol, filterSymbol, resultSymbol, serializerResponseSymbol;

    beforeEach(function () {
      sinon.stub(usecases, 'findAssessmentParticipationResultList');
      campaignAssessmentResultMinimalSerializer = {
        serialize: sinon.stub(),
      };
      pageSymbol = Symbol('pageSymbol');
      filterSymbol = Symbol('filter');
      resultSymbol = Symbol('result');
      serializerResponseSymbol = Symbol('serialize');
    });

    it('should return serialized results', async function () {
      // given
      usecases.findAssessmentParticipationResultList
        .withArgs({
          campaignId,
          page: pageSymbol,
          filters: filterSymbol,
        })
        .resolves(resultSymbol);
      campaignAssessmentResultMinimalSerializer.serialize.withArgs(resultSymbol).resolves(serializerResponseSymbol);
      const request = {
        auth: { credentials: { userId } },
        params: { campaignId },
        query: {
          page: pageSymbol,
          filter: filterSymbol,
        },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignResultsController.findAssessmentParticipationResults(request, hFake, {
        campaignAssessmentResultMinimalSerializer,
      });

      // then
      expect(response).to.equal(serializerResponseSymbol);
    });
  });
});
