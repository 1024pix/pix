import { campaignController } from '../../../../lib/application/campaigns/campaign-controller.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';
import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../test-helper.js';

const { FRENCH_SPOKEN } = LOCALE;

describe('Unit | Application | Controller | Campaign', function () {
  describe('#getByCode', function () {
    it('should return the serialized campaign', async function () {
      // given
      const code = 'AZERTY123';
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ code, identityProvider: 'SUPER_IDP' });
      const request = {
        query: { 'filter[code]': code },
      };
      sinon.stub(usecases, 'getCampaignByCode').withArgs({ code }).resolves(campaignToJoin);

      // when
      const response = await campaignController.getByCode(request, hFake);

      // then
      expect(response.data).to.deep.equal({
        type: 'campaigns',
        id: campaignToJoin.id.toString(),
        attributes: {
          code: campaignToJoin.code,
          title: campaignToJoin.title,
          type: campaignToJoin.type,
          'id-pix-label': campaignToJoin.idPixLabel,
          'custom-landing-page-text': campaignToJoin.customLandingPageText,
          'external-id-help-image-url': campaignToJoin.externalIdHelpImageUrl,
          'alternative-text-to-external-id-help-image': campaignToJoin.alternativeTextToExternalIdHelpImage,
          'is-archived': campaignToJoin.isArchived,
          'is-restricted': campaignToJoin.isRestricted,
          'is-simplified-access': campaignToJoin.isSimplifiedAccess,
          'is-for-absolute-novice': campaignToJoin.isForAbsoluteNovice,
          'identity-provider': campaignToJoin.identityProvider,
          'organization-id': campaignToJoin.organizationId,
          'organization-name': campaignToJoin.organizationName,
          'organization-type': campaignToJoin.organizationType,
          'organization-logo-url': campaignToJoin.organizationLogoUrl,
          'organization-show-nps': campaignToJoin.organizationShowNPS,
          'organization-form-nps-url': campaignToJoin.organizationFormNPSUrl,
          'target-profile-name': campaignToJoin.targetProfileName,
          'target-profile-image-url': campaignToJoin.targetProfileImageUrl,
          'custom-result-page-text': campaignToJoin.customResultPageText,
          'custom-result-page-button-text': campaignToJoin.customResultPageButtonText,
          'custom-result-page-button-url': campaignToJoin.customResultPageButtonUrl,
          'multiple-sendings': campaignToJoin.multipleSendings,
          'is-flash': campaignToJoin.isFlash,
        },
      });
    });
  });

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
        params: { id: campaignId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignController.getCollectiveResult(request, hFake, {
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
        params: { id: campaignId },
        auth: {
          credentials: { userId },
        },
      };
      usecases.computeCampaignCollectiveResult.rejects(error);

      // when
      const errorCatched = await catchErr(campaignController.getCollectiveResult)(request);

      // then
      expect(errorCatched).to.be.instanceof(UserNotAuthorizedToAccessEntityError);
    });
  });

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
