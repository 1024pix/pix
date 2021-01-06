const _ = require('lodash');

const { sinon, expect, domainBuilder, hFake, catchErr } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const campaignAnalysisSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer');
const campaignCollectiveResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Application | Controller | Campaign', () => {

  describe('#save', () => {

    const deserializedCampaign = domainBuilder.buildCampaign({ id: NaN, code: '' });

    beforeEach(() => {
      sinon.stub(usecases, 'createCampaign');
      sinon.stub(campaignSerializer, 'deserialize').resolves(deserializedCampaign);
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should call the use case to create the new campaign', async () => {
      // given
      const connectedUserId = 1;
      const request = { auth: { credentials: { userId: connectedUserId } } };

      const createdCampaign = domainBuilder.buildCampaign();
      usecases.createCampaign.resolves(createdCampaign);

      // when
      await campaignController.save(request, hFake);

      // then
      expect(usecases.createCampaign).to.have.been.calledOnce;
      const { campaign } = usecases.createCampaign.firstCall.args[0];
      expect(campaign).to.include({
        ..._.pick(deserializedCampaign, ['name', 'type', 'organizationId']),
        creatorId: connectedUserId,
      });
    });

    it('should return a serialized campaign when the campaign has been successfully created', async () => {
      // given
      const userId = 1245;
      const request = { auth: { credentials: { userId } } };

      const createdCampaign = domainBuilder.buildCampaign();
      usecases.createCampaign.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      const response = await campaignController.save(request, hFake);

      // then
      expect(campaignSerializer.serialize).to.have.been.calledWith(createdCampaign);
      expect(response.source).to.deep.equal(serializedCampaign);
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

  describe('#getByCode ', () => {

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
          'organization-name': campaignToJoin.organizationName,
          'organization-type': campaignToJoin.organizationType,
          'organization-logo-url': campaignToJoin.organizationLogoUrl,
          'target-profile-name': campaignToJoin.targetProfileName,
          'target-profile-image-url': campaignToJoin.targetProfileImageUrl,
        },
      });
    });

  });

  describe('#getById ', () => {
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
      sinon.stub(campaignSerializer, 'serialize');
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(tokenService, 'createTokenForCampaignResults');

      queryParamsUtils.extractParameters.withArgs({}).returns({});
      tokenService.createTokenForCampaignResults.withArgs(request.auth.credentials.userId).returns('token');
    });

    it('should return the campaign', async () => {
      // given
      const tokenForCampaignResults = 'token';
      const expectedCampaign = { ...campaign, tokenForCampaignResults };
      usecases.getCampaign.withArgs({ campaignId: campaign.id, options: {} }).resolves(campaign);
      campaignSerializer.serialize.withArgs(campaign, {}, { tokenForCampaignResults }).returns(expectedCampaign);

      // when
      const response = await campaignController.getById(request, hFake);

      // then
      expect(response).to.deep.equal(expectedCampaign);
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
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should return the updated campaign', async () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).resolves(updatedCampaign);
      campaignSerializer.serialize.withArgs(updatedCampaign).returns(updatedCampaign);

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response).to.deep.equal(updatedCampaign);
    });
  });

  describe('#getReport', () => {

    const campaignId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'getCampaignReport');
      sinon.stub(campaignReportSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.getCampaignReport.withArgs({ campaignId }).resolves({});
      campaignReportSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignController.getReport({ params: { id: campaignId } });

      // then
      expect(response).to.be.equal('ok');
    });

  });

  describe('#getCollectiveResult', () => {

    const campaignId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'computeCampaignCollectiveResult');
      sinon.stub(campaignCollectiveResultSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.computeCampaignCollectiveResult.resolves({});
      campaignCollectiveResultSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignController.getCollectiveResult({
        params: { id: campaignId },
        auth: {
          credentials: { userId },
        },
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
          credentials: { userId },
        },
      };
      usecases.computeCampaignCollectiveResult.rejects(error);

      // when
      const errorCatched = await catchErr(campaignController.getCollectiveResult)(request);

      // then
      expect(errorCatched).to.be.instanceof(UserNotAuthorizedToAccessEntity);
    });

  });

  describe('#getAnalysis', () => {

    const campaignId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'computeCampaignAnalysis');
      sinon.stub(campaignAnalysisSerializer, 'serialize');
    });

    it('should return an unauthorized error', async () => {
      // given
      const error = new UserNotAuthorizedToAccessEntity('User does not have access to this campaign');
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
      expect(errorCatched).to.be.instanceof(UserNotAuthorizedToAccessEntity);
    });
  });

  describe('archiveCampaign', async () => {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'archiveCampaign');
      sinon.stub(campaignSerializer, 'serialize').withArgs(updatedCampaign).resolves(serializedCampaign);
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async () => {
      // given
      usecases.archiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignSerializer.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

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
      sinon.stub(campaignSerializer, 'serialize').withArgs(updatedCampaign).resolves(serializedCampaign);
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async () => {
      // given
      usecases.unarchiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignSerializer.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

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
