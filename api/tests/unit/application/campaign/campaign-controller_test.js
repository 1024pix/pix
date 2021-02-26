const { sinon, expect, domainBuilder, hFake, catchErr } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

const campaignAnalysisSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer');
const campaignCollectiveResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntityError } = require('../../../../lib/domain/errors');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Unit | Application | Controller | Campaign', () => {

  describe('#save', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'createCampaign');
      sinon.stub(campaignReportSerializer, 'serialize');
    });

    it('should return a serialized campaign when the campaign has been successfully created', async () => {
      // given
      const connectedUserId = 1;
      const request = {
        auth: { credentials: { userId: connectedUserId } },
        payload: {
          data: {
            attributes: {
              name: 'name',
              type: 'ASSESSMENT',
              title: 'title',
              'id-pix-label': 'idPixLabel',
              'custom-landing-page-text': 'customLandingPageText',
            },
            relationships: {
              'target-profile': { data: { id: '123' } },
              'organization': { data: { id: '456' } },
            },
          },
        },
        i18n: {
          __: sinon.stub(),
        },
      };
      const campaign = {
        name: 'name',
        type: 'ASSESSMENT',
        title: 'title',
        idPixLabel: 'idPixLabel',
        customLandingPageText: 'customLandingPageText',
        organizationId: 456,
        targetProfileId: 123,
        creatorId: 1,
      };

      const expectedResult = Symbol('result');
      const createdCampaign = Symbol('created campaign');
      usecases.createCampaign.withArgs({ campaign }).resolves(createdCampaign);
      campaignReportSerializer.serialize.withArgs(createdCampaign).returns(expectedResult);

      // when
      const response = await campaignController.save(request, hFake);

      // then
      expect(response.source).to.equal(expectedResult);
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#getCsvAssessmentResults', () => {
    const userId = 1;
    const campaignId = 2;
    const request = {
      query: {
        accessToken: 'token',
      },
      params: {
        id: campaignId,
      },
      i18n: {
        __: sinon.stub(),
      },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream');
      sinon.stub(tokenService, 'extractUserIdForCampaignResults').resolves(userId);
    });

    it('should call the use case to get result campaign in csv', async () => {
      // given
      usecases.startWritingCampaignAssessmentResultsToStream.resolves({ fileName: 'any file name' });

      // when
      await campaignController.getCsvAssessmentResults(request);

      // then
      expect(usecases.startWritingCampaignAssessmentResultsToStream).to.have.been.calledOnce;
      const getResultsCampaignArgs = usecases.startWritingCampaignAssessmentResultsToStream.firstCall.args[0];
      expect(getResultsCampaignArgs).to.have.property('userId');
      expect(getResultsCampaignArgs).to.have.property('campaignId');
    });

    it('should return a response with correct headers', async () => {
      // given
      usecases.startWritingCampaignAssessmentResultsToStream.resolves({ fileName: 'expected file name' });

      // when
      const response = await campaignController.getCsvAssessmentResults(request);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected file name"');
      expect(response.headers['content-encoding']).to.equal('identity');
    });

    it('should fix invalid header chars in filename', async () => {
      // given
      usecases.startWritingCampaignAssessmentResultsToStream.resolves({ fileName: 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv' });

      // when
      const response = await campaignController.getCsvAssessmentResults(request);

      // then
      expect(response.headers['content-disposition']).to.equal('attachment; filename="file-name with invalid_chars _____________.csv"');
    });
  });

  describe('#getCsvProfilesCollectionResult', () => {
    const userId = 1;
    const campaignId = 2;
    const request = {
      query: {
        accessToken: 'token',
      },
      params: {
        id: campaignId,
      },
      i18n: {
        __: sinon.stub(),
      },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream');
      sinon.stub(tokenService, 'extractUserIdForCampaignResults').resolves(userId);
    });

    it('should call the use case to get result campaign in csv', async () => {
      // given
      usecases.startWritingCampaignProfilesCollectionResultsToStream.resolves({ fileName: 'any file name' });

      // when
      await campaignController.getCsvProfilesCollectionResults(request);

      // then
      expect(usecases.startWritingCampaignProfilesCollectionResultsToStream).to.have.been.calledOnce;
      const getResultsCampaignArgs = usecases.startWritingCampaignProfilesCollectionResultsToStream.firstCall.args[0];
      expect(getResultsCampaignArgs).to.have.property('userId');
      expect(getResultsCampaignArgs).to.have.property('campaignId');
    });

    it('should return a response with correct headers', async () => {
      // given
      usecases.startWritingCampaignProfilesCollectionResultsToStream.resolves({ fileName: 'expected file name' });

      // when
      const response = await campaignController.getCsvProfilesCollectionResults(request);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected file name"');
      expect(response.headers['content-encoding']).to.equal('identity');
    });

    it('should fix invalid header chars in filename', async () => {
      // given
      usecases.startWritingCampaignProfilesCollectionResultsToStream.resolves({ fileName: 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv' });

      // when
      const response = await campaignController.getCsvProfilesCollectionResults(request);

      // then
      expect(response.headers['content-disposition']).to.equal('attachment; filename="file-name with invalid_chars _____________.csv"');
    });
  });

  describe('#getByCode', () => {

    it('should return the serialized campaign', async () => {
      // given
      const code = 'AZERTY123';
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ code });
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
          'code': campaignToJoin.code,
          'title': campaignToJoin.title,
          'type': campaignToJoin.type,
          'id-pix-label': campaignToJoin.idPixLabel,
          'custom-landing-page-text': campaignToJoin.customLandingPageText,
          'external-id-help-image-url': campaignToJoin.externalIdHelpImageUrl,
          'alternative-text-to-external-id-help-image': campaignToJoin.alternativeTextToExternalIdHelpImage,
          'is-archived': campaignToJoin.isArchived,
          'is-restricted': campaignToJoin.isRestricted,
          'is-simplified-access': campaignToJoin.isSimplifiedAccess,
          'is-for-absolute-novice': campaignToJoin.isForAbsoluteNovice,
          'organization-is-pole-emploi': campaignToJoin.organizationIsPoleEmploi,
          'organization-name': campaignToJoin.organizationName,
          'organization-type': campaignToJoin.organizationType,
          'organization-logo-url': campaignToJoin.organizationLogoUrl,
          'target-profile-name': campaignToJoin.targetProfileName,
          'target-profile-image-url': campaignToJoin.targetProfileImageUrl,
        },
      });
    });

  });

  describe('#getById', () => {

    const campaignId = 1;
    const userId = 1;

    let request, campaign;

    beforeEach(() => {
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
      sinon.stub(campaignReportSerializer, 'serialize');
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(tokenService, 'createTokenForCampaignResults');

      queryParamsUtils.extractParameters.withArgs({}).returns({});
      tokenService.createTokenForCampaignResults.withArgs(request.auth.credentials.userId).returns('token');
      usecases.getCampaign.resolves(campaign);
    });

    it('should return the campaign', async () => {
      // given
      const expectedResult = Symbol('ok');
      const tokenForCampaignResults = 'token';
      campaignReportSerializer.serialize.withArgs(campaign, {}, { tokenForCampaignResults }).returns(expectedResult);

      // when
      const response = await campaignController.getById(request, hFake);

      // then
      expect(usecases.getCampaign).calledWith({ campaignId, userId });
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#update', () => {
    let request, updatedCampaign, updateCampaignArgs;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { id: 1 },
        payload: {
          data: {
            attributes: {
              name: 'New name',
              title: 'New title',
              'custom-landing-page-text': 'New text',
            },
          },
        },
      };

      updatedCampaign = {
        id: request.params.id,
        name: request.payload.data.attributes.name,
        title: request.payload.data.attributes.title,
        customLandingPageText: request.payload.data.attributes['custom-landing-page-text'],
      };

      updateCampaignArgs = {
        userId: request.auth.credentials.userId,
        campaignId: updatedCampaign.id,
        name: updatedCampaign.name,
        title: updatedCampaign.title,
        customLandingPageText: updatedCampaign.customLandingPageText,
      };

      sinon.stub(usecases, 'updateCampaign');
      sinon.stub(campaignReportSerializer, 'serialize');
    });

    it('should return the updated campaign', async () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).resolves(updatedCampaign);
      campaignReportSerializer.serialize.withArgs(updatedCampaign).returns(updatedCampaign);

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response).to.deep.equal(updatedCampaign);
    });
  });

  describe('#getCollectiveResult', () => {

    const campaignId = 1;
    const userId = 1;
    const locale = FRENCH_SPOKEN;

    beforeEach(() => {
      sinon.stub(usecases, 'computeCampaignCollectiveResult');
      sinon.stub(campaignCollectiveResultSerializer, 'serialize');
    });

    it('should return expected results', async () => {
      // given
      const campaignCollectiveResult = Symbol('campaignCollectiveResults');
      const expectedResults = Symbol('results');
      usecases.computeCampaignCollectiveResult.withArgs({ userId, campaignId, locale }).resolves(campaignCollectiveResult);
      campaignCollectiveResultSerializer.serialize.withArgs(campaignCollectiveResult).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { id: campaignId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignController.getCollectiveResult(request);

      // then
      expect(response).to.equal(expectedResults);
    });

    it('should return an unauthorized error', async () => {
      // given
      const error = new UserNotAuthorizedToAccessEntityError('User does not have access to this campaign participation');
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

  describe('#getAnalysis', () => {
    const campaignId = 1;
    const userId = 1;
    const locale = FRENCH_SPOKEN;

    beforeEach(() => {
      sinon.stub(usecases, 'computeCampaignAnalysis');
      sinon.stub(campaignAnalysisSerializer, 'serialize');
    });

    it('should return expected results', async () => {
      // given
      const campaignAnalysis = Symbol('campaignAnalysis');
      const expectedResults = Symbol('results');
      usecases.computeCampaignAnalysis.withArgs({ userId, campaignId, locale }).resolves(campaignAnalysis);
      campaignAnalysisSerializer.serialize.withArgs(campaignAnalysis).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { id: campaignId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignController.getAnalysis(request);

      // then
      expect(response).to.equal(expectedResults);
    });

    it('should return an unauthorized error', async () => {
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

  describe('archiveCampaign', async () => {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'archiveCampaign');
      sinon.stub(campaignReportSerializer, 'serialize').withArgs(updatedCampaign).resolves(serializedCampaign);
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async () => {
      // given
      usecases.archiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignReportSerializer.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

      // when
      const response = await campaignController.archiveCampaign({
        params: { id: campaignId },
        auth: {
          credentials: { userId },
        },
      });

      // then
      expect(response).to.be.equal(serializedCampaign);
    });

  });

  describe('unarchiveCampaign', async () => {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'unarchiveCampaign');
      sinon.stub(campaignReportSerializer, 'serialize').withArgs(updatedCampaign).resolves(serializedCampaign);
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async () => {
      // given
      usecases.unarchiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignReportSerializer.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

      // when
      const response = await campaignController.unarchiveCampaign({
        params: { id: campaignId },
        auth: {
          credentials: { userId },
        },
      });

      // then
      expect(response).to.be.equal(serializedCampaign);
    });

  });
});
