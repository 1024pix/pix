import { campaignController } from '../../../../../src/prescription/campaign/application/campaign-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../../src/shared/domain/errors.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { catchErr, expect, hFake, sinon } from '../../../../test-helper.js';

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
        params: { campaignId },
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
        params: { campaignId },
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

  describe('#getPresentationSteps', function () {
    it('should return expected results', async function () {
      // given
      const userId = Symbol('userId');
      const campaignCode = Symbol('campaign code');
      const locale = FRENCH_SPOKEN;

      sinon.stub(usecases, 'getPresentationSteps');

      const dependencies = {
        extractLocaleFromRequestStub: sinon.stub().returns(locale),
        presentationStepsSerializerStub: {
          serialize: sinon.stub(),
        },
      };

      const presentationSteps = Symbol('presentation steps');
      const expectedResults = Symbol('results');

      usecases.getPresentationSteps.withArgs({ userId, campaignCode, locale }).resolves(presentationSteps);
      dependencies.presentationStepsSerializerStub.serialize.withArgs(presentationSteps).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignCode },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignController.getPresentationSteps(request, hFake, {
        extractLocaleFromRequest: dependencies.extractLocaleFromRequestStub,
        presentationStepsSerializer: dependencies.presentationStepsSerializerStub,
      });

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#getLevelPerTubesAndCompetences', function () {
    const campaignId = 1;
    const locale = FRENCH_SPOKEN;
    let campaignResultLevelsPerTubesAndCompetencesSerializerStub;

    beforeEach(function () {
      sinon.stub(usecases, 'getResultLevelsPerTubesAndCompetences');
      campaignResultLevelsPerTubesAndCompetencesSerializerStub = {
        serialize: sinon.stub(),
      };
    });

    it('should return expected results', async function () {
      // given
      const resultLevels = Symbol('resultLevels');
      const expectedResults = Symbol('results');
      usecases.getResultLevelsPerTubesAndCompetences.withArgs({ campaignId, locale }).resolves(resultLevels);
      campaignResultLevelsPerTubesAndCompetencesSerializerStub.serialize
        .withArgs(resultLevels)
        .returns(expectedResults);

      const request = {
        params: { campaignId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignController.getLevelPerTubesAndCompetences(request, hFake, {
        campaignResultLevelsPerTubesAndCompetencesSerializer: campaignResultLevelsPerTubesAndCompetencesSerializerStub,
      });

      // then
      expect(response).to.equal(expectedResults);
    });
  });
});
