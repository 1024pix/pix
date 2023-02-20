import { sinon, expect, domainBuilder, hFake, catchErr } from '../../../test-helper';
import campaignController from '../../../../lib/application/campaigns/campaign-controller';
import campaignAnalysisSerializer from '../../../../lib/infrastructure/serializers/jsonapi/campaign-analysis-serializer';
import campaignReportSerializer from '../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer';
import campaignCollectiveResultSerializer from '../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer';
import campaignParticipantsActivitySerializer from '../../../../lib/infrastructure/serializers/jsonapi/campaign-participant-activity-serializer';
import tokenService from '../../../../lib/domain/services/token-service';
import usecases from '../../../../lib/domain/usecases';
import { UserNotAuthorizedToAccessEntityError, ForbiddenAccess } from '../../../../lib/domain/errors';
import queryParamsUtils from '../../../../lib/infrastructure/utils/query-params-utils';
import { LOCALE } from '../../../../lib/domain/constants';

const { FRENCH_SPOKEN: FRENCH_SPOKEN } = LOCALE;

describe('Unit | Application | Controller | Campaign', function () {
  describe('#save', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'createCampaign');
      sinon.stub(campaignReportSerializer, 'serialize');
    });

    it('should return a serialized campaign when the campaign has been successfully created', async function () {
      // given
      const connectedUserId = 1;
      const ownerId = 4;
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
              'multiple-sendings': true,
              'owner-id': ownerId,
            },
            relationships: {
              'target-profile': { data: { id: '123' } },
              organization: { data: { id: '456' } },
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
        ownerId: 4,
        multipleSendings: true,
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

    it('should set the creator as the owner when no owner is provided', async function () {
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
              'multiple-sendings': true,
            },
            relationships: {
              'target-profile': { data: { id: '123' } },
              organization: { data: { id: '456' } },
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
        ownerId: 1,
        multipleSendings: true,
      };

      const expectedResult = Symbol('result');
      const createdCampaign = Symbol('created campaign');
      usecases.createCampaign.withArgs({ campaign }).resolves(createdCampaign);
      campaignReportSerializer.serialize.withArgs(createdCampaign).returns(expectedResult);

      // when
      const response = await campaignController.save(request, hFake);

      // then
      expect(response.source).to.equal(expectedResult);
    });
  });

  describe('#getCsvAssessmentResults', function () {
    it('should call the use case to get result campaign in csv', async function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId });
      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves({ fileName: 'any file name' });

      // when
      await campaignController.getCsvAssessmentResults(request);

      // then
      expect(usecases.startWritingCampaignAssessmentResultsToStream).to.have.been.calledOnce;
      const getResultsCampaignArgs = usecases.startWritingCampaignAssessmentResultsToStream.firstCall.args[0];
      expect(getResultsCampaignArgs).to.have.property('userId');
      expect(getResultsCampaignArgs).to.have.property('campaignId');
    });

    it('should return a response with correct headers', async function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId });
      sinon
        .stub(usecases, 'startWritingCampaignAssessmentResultsToStream')
        .resolves({ fileName: 'expected file name' });

      // when
      const response = await campaignController.getCsvAssessmentResults(request);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected file name"');
      expect(response.headers['content-encoding']).to.equal('identity');
    });

    it('should fix invalid header chars in filename', async function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId });
      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves({
        fileName: 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv',
      });

      // when
      const response = await campaignController.getCsvAssessmentResults(request);

      // then
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename="file-name with invalid_chars _____________.csv"'
      );
    });

    context('when the campaign id is not the same as provided in the access token', function () {
      it('should throw an error', async function () {
        // given
        const userId = 1;
        const campaignId = 2;
        const request = _getRequestForCampaignId(campaignId);

        sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId: 19 });
        sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves();

        // when
        const error = await catchErr(campaignController.getCsvAssessmentResults)(request);

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(usecases.startWritingCampaignAssessmentResultsToStream).to.not.have.been.called;
      });
    });

    context('when the access token is invalid', function () {
      it('should throw an error', async function () {
        // given
        const request = _getRequestForCampaignId(1);

        sinon.stub(tokenService, 'extractCampaignResultsTokenContent').throws(new ForbiddenAccess());
        sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves();

        // when
        const error = await catchErr(campaignController.getCsvAssessmentResults)(request);

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(usecases.startWritingCampaignAssessmentResultsToStream).to.not.have.been.called;
      });
    });
  });

  describe('#getCsvProfilesCollectionResult', function () {
    it('should call the use case to get result campaign in csv', async function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon
        .stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream')
        .resolves({ fileName: 'any file name' });
      sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId });

      // when
      await campaignController.getCsvProfilesCollectionResults(request);

      // then
      expect(usecases.startWritingCampaignProfilesCollectionResultsToStream).to.have.been.calledOnce;
      const getResultsCampaignArgs = usecases.startWritingCampaignProfilesCollectionResultsToStream.firstCall.args[0];
      expect(getResultsCampaignArgs).to.have.property('userId');
      expect(getResultsCampaignArgs).to.have.property('campaignId');
    });

    it('should return a response with correct headers', async function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon
        .stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream')
        .resolves({ fileName: 'expected file name' });
      sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId });

      // when
      const response = await campaignController.getCsvProfilesCollectionResults(request);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected file name"');
      expect(response.headers['content-encoding']).to.equal('identity');
    });

    it('should fix invalid header chars in filename', async function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream').resolves({
        fileName: 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv',
      });
      sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId });

      // when
      const response = await campaignController.getCsvProfilesCollectionResults(request);

      // then
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename="file-name with invalid_chars _____________.csv"'
      );
    });

    context('when the campaign id is not the same as provided in the access token', function () {
      it('should throw an error', async function () {
        // given
        const userId = 1;
        const campaignId = 2;
        const request = _getRequestForCampaignId(campaignId);

        sinon.stub(tokenService, 'extractCampaignResultsTokenContent').returns({ userId, campaignId: 19 });
        sinon.stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream');

        // when
        const error = await catchErr(campaignController.getCsvProfilesCollectionResults)(request);

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(usecases.startWritingCampaignProfilesCollectionResultsToStream).to.not.have.been.called;
      });
    });

    context('when the access token is invalid', function () {
      it('should throw an error', async function () {
        // given
        const request = _getRequestForCampaignId(1);

        sinon.stub(tokenService, 'extractCampaignResultsTokenContent').throws(new ForbiddenAccess());
        sinon.stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream').resolves();

        // when
        const error = await catchErr(campaignController.getCsvProfilesCollectionResults)(request);

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(usecases.startWritingCampaignProfilesCollectionResultsToStream).to.not.have.been.called;
      });
    });
  });

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

  describe('#getById', function () {
    const campaignId = 1;
    const userId = 1;

    let request, campaign;

    beforeEach(function () {
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
      tokenService.createTokenForCampaignResults.returns('token');
      usecases.getCampaign.resolves(campaign);
    });

    it('should return the campaign', async function () {
      // given
      const expectedResult = Symbol('ok');
      const tokenForCampaignResults = 'token';
      campaignReportSerializer.serialize.withArgs(campaign, {}, { tokenForCampaignResults }).returns(expectedResult);

      // when
      const response = await campaignController.getById(request, hFake);

      // then
      expect(usecases.getCampaign).calledWith({ campaignId, userId });
      expect(tokenService.createTokenForCampaignResults).to.have.been.calledWith({ userId, campaignId });
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#update', function () {
    it('should return the updated campaign', async function () {
      // given
      const request = {
        auth: { credentials: { userId: 1 } },
        params: { id: 1 },
        deserializedPayload: {
          name: 'New name',
          title: 'New title',
          customLandingPageText: 'New text',
          ownerId: 5,
        },
      };

      const updatedCampaign = Symbol('campaign');
      const updatedCampaignSerialized = Symbol('campaign serialized');

      sinon
        .stub(usecases, 'updateCampaign')
        .withArgs({ userId: 1, campaignId: 1, ...request.deserializedPayload })
        .resolves(updatedCampaign);
      sinon.stub(campaignReportSerializer, 'serialize').withArgs(updatedCampaign).returns(updatedCampaignSerialized);

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response).to.deep.equal(updatedCampaignSerialized);
    });
  });

  describe('#getCollectiveResult', function () {
    const campaignId = 1;
    const userId = 1;
    const locale = FRENCH_SPOKEN;

    beforeEach(function () {
      sinon.stub(usecases, 'computeCampaignCollectiveResult');
      sinon.stub(campaignCollectiveResultSerializer, 'serialize');
    });

    it('should return expected results', async function () {
      // given
      const campaignCollectiveResult = Symbol('campaignCollectiveResults');
      const expectedResults = Symbol('results');
      usecases.computeCampaignCollectiveResult
        .withArgs({ userId, campaignId, locale })
        .resolves(campaignCollectiveResult);
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

    it('should return an unauthorized error', async function () {
      // given
      const error = new UserNotAuthorizedToAccessEntityError(
        'User does not have access to this campaign participation'
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

    beforeEach(function () {
      sinon.stub(usecases, 'computeCampaignAnalysis');
      sinon.stub(campaignAnalysisSerializer, 'serialize');
    });

    it('should return expected results', async function () {
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

  describe('#archiveCampaign', function () {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;

    beforeEach(function () {
      sinon.stub(usecases, 'archiveCampaign');
      sinon.stub(campaignReportSerializer, 'serialize').withArgs(updatedCampaign).resolves(serializedCampaign);
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async function () {
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

  describe('#unarchiveCampaign', function () {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;

    beforeEach(function () {
      sinon.stub(usecases, 'unarchiveCampaign');
      sinon.stub(campaignReportSerializer, 'serialize').withArgs(updatedCampaign).resolves(serializedCampaign);
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async function () {
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

  describe('#findParticipantsActivity', function () {
    let serializedParticipantsActivities;
    let participantsActivities;
    const filters = { status: 'SHARED', groups: ['L1'], search: 'Choupette' };

    const campaignId = 1;
    const userId = 1;

    beforeEach(function () {
      participantsActivities = Symbol('participants activities');
      serializedParticipantsActivities = Symbol('serialized participants activities');
      sinon.stub(usecases, 'findPaginatedCampaignParticipantsActivities');
      sinon
        .stub(campaignParticipantsActivitySerializer, 'serialize')
        .withArgs({ participantsActivities })
        .resolves(serializedParticipantsActivities);
    });

    it('should return the participants activities properly serialized', async function () {
      // given
      usecases.findPaginatedCampaignParticipantsActivities
        .withArgs({ campaignId, userId, page: { number: 3 }, filters })
        .resolves(participantsActivities);
      campaignParticipantsActivitySerializer.serialize
        .withArgs(participantsActivities)
        .returns(serializedParticipantsActivities);

      // when
      const response = await campaignController.findParticipantsActivity({
        params: { id: campaignId },
        auth: {
          credentials: { userId },
        },

        query: {
          'page[number]': 3,
          'filter[groups][]': ['L1'],
          'filter[status]': 'SHARED',
          'filter[search]': 'Choupette',
        },
      });

      // then
      expect(response).to.be.equal(serializedParticipantsActivities);
    });
  });
});

function _getRequestForCampaignId(campaignId) {
  return {
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
}
