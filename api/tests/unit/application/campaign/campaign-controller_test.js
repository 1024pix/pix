import { sinon, expect, domainBuilder, hFake, catchErr } from '../../../test-helper.js';
import { campaignController } from '../../../../lib/application/campaigns/campaign-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';
import { ForbiddenAccess } from '../../../../src/shared/domain/errors.js';

const { FRENCH_SPOKEN } = LOCALE;

describe('Unit | Application | Controller | Campaign', function () {
  describe('#getCsvAssessmentResults', function () {
    it('should call the use case to get result campaign in csv', async function () {
      // given
      const userId = 1;
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      const tokenServiceStub = {
        extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId }),
      };
      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves({ fileName: 'any file name' });
      const dependencies = { tokenService: tokenServiceStub };

      // when
      await campaignController.getCsvAssessmentResults(request, hFake, dependencies);

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

      const tokenServiceStub = {
        extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId }),
      };
      sinon
        .stub(usecases, 'startWritingCampaignAssessmentResultsToStream')
        .resolves({ fileName: 'expected file name' });
      const dependencies = { tokenService: tokenServiceStub };

      // when
      const response = await campaignController.getCsvAssessmentResults(request, hFake, dependencies);

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

      const tokenServiceStub = {
        extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId }),
      };
      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves({
        fileName: 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv',
      });
      const dependencies = { tokenService: tokenServiceStub };

      // when
      const response = await campaignController.getCsvAssessmentResults(request, hFake, dependencies);

      // then
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename="file-name with invalid_chars _____________.csv"',
      );
    });

    context('when the campaign id is not the same as provided in the access token', function () {
      it('should throw an error', async function () {
        // given
        const userId = 1;
        const campaignId = 2;
        const request = _getRequestForCampaignId(campaignId);

        const tokenServiceStub = {
          extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId: 19 }),
        };
        sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves();
        const dependencies = { tokenService: tokenServiceStub };

        // when
        const error = await catchErr(campaignController.getCsvAssessmentResults)(request, hFake, dependencies);

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(usecases.startWritingCampaignAssessmentResultsToStream).to.not.have.been.called;
      });
    });

    context('when the access token is invalid', function () {
      it('should throw an error', async function () {
        // given
        const request = _getRequestForCampaignId(1);

        const tokenServiceStub = {
          extractCampaignResultsTokenContent: sinon.stub().throws(new ForbiddenAccess()),
        };
        sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves();
        const dependencies = { tokenService: tokenServiceStub };

        // when
        const error = await catchErr(campaignController.getCsvAssessmentResults)(request, hFake, dependencies);

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

      const tokenServiceStub = {
        extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId }),
      };

      // when
      await campaignController.getCsvProfilesCollectionResults(request, hFake, { tokenService: tokenServiceStub });

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

      const tokenServiceStub = {
        extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId }),
      };

      // when
      const response = await campaignController.getCsvProfilesCollectionResults(request, hFake, {
        tokenService: tokenServiceStub,
      });

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

      const tokenServiceStub = {
        extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId }),
      };

      // when
      const response = await campaignController.getCsvProfilesCollectionResults(request, hFake, {
        tokenService: tokenServiceStub,
      });

      // then
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename="file-name with invalid_chars _____________.csv"',
      );
    });

    context('when the campaign id is not the same as provided in the access token', function () {
      it('should throw an error', async function () {
        // given
        const userId = 1;
        const campaignId = 2;
        const request = _getRequestForCampaignId(campaignId);

        sinon.stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream');
        const tokenServiceStub = {
          extractCampaignResultsTokenContent: sinon.stub().returns({ userId, campaignId: 19 }),
        };

        // when
        const error = await catchErr(campaignController.getCsvProfilesCollectionResults)(request, hFake, {
          tokenService: tokenServiceStub,
        });

        // then
        expect(error).to.be.an.instanceOf(ForbiddenAccess);
        expect(usecases.startWritingCampaignProfilesCollectionResultsToStream).to.not.have.been.called;
      });
    });

    context('when the access token is invalid', function () {
      it('should throw an error', async function () {
        // given
        const request = _getRequestForCampaignId(1);

        sinon.stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream').resolves();
        const tokenServiceStub = {
          extractCampaignResultsTokenContent: sinon.stub().throws(new ForbiddenAccess()),
        };

        // when
        const error = await catchErr(campaignController.getCsvProfilesCollectionResults)(request, hFake, {
          tokenService: tokenServiceStub,
        });

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
      const campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      campaignReportSerializerStub.serialize.withArgs(updatedCampaign).returns(updatedCampaignSerialized);
      // when
      const response = await campaignController.update(request, hFake, {
        campaignReportSerializer: campaignReportSerializerStub,
      });

      // then
      expect(response).to.deep.equal(updatedCampaignSerialized);
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

  describe('#archiveCampaign', function () {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;
    let campaignReportSerializerStub;
    beforeEach(function () {
      sinon.stub(usecases, 'archiveCampaign');
      campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async function () {
      // given
      usecases.archiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignReportSerializerStub.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

      // when
      const response = await campaignController.archiveCampaign(
        {
          params: { id: campaignId },
          auth: {
            credentials: { userId },
          },
        },
        hFake,
        { campaignReportSerializer: campaignReportSerializerStub },
      );

      // then
      expect(response).to.be.equal(serializedCampaign);
    });
  });

  describe('#unarchiveCampaign', function () {
    let updatedCampaign;
    let serializedCampaign;

    const campaignId = 1;
    const userId = 1;
    let campaignReportSerializerStub;
    beforeEach(function () {
      sinon.stub(usecases, 'unarchiveCampaign');

      campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      updatedCampaign = Symbol('updated campaign');
      serializedCampaign = Symbol('serialized campaign');
    });

    it('should return the updated campaign properly serialized', async function () {
      // given
      usecases.unarchiveCampaign.withArgs({ userId, campaignId }).resolves(updatedCampaign);
      campaignReportSerializerStub.serialize.withArgs(updatedCampaign).returns(serializedCampaign);

      // when
      const response = await campaignController.unarchiveCampaign(
        {
          params: { id: campaignId },
          auth: {
            credentials: { userId },
          },
        },
        hFake,
        { campaignReportSerializer: campaignReportSerializerStub },
      );

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
    let campaignParticipantsActivitySerializerStub;
    beforeEach(function () {
      participantsActivities = Symbol('participants activities');
      serializedParticipantsActivities = Symbol('serialized participants activities');
      sinon.stub(usecases, 'findPaginatedCampaignParticipantsActivities');
      campaignParticipantsActivitySerializerStub = {
        serialize: sinon.stub(),
      };
    });

    it('should return the participants activities properly serialized', async function () {
      // given
      usecases.findPaginatedCampaignParticipantsActivities
        .withArgs({ campaignId, userId, page: { number: 3 }, filters })
        .resolves(participantsActivities);
      campaignParticipantsActivitySerializerStub.serialize
        .withArgs(participantsActivities)
        .returns(serializedParticipantsActivities);

      // when
      const response = await campaignController.findParticipantsActivity(
        {
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
        },
        hFake,
        { campaignParticipantsActivitySerializer: campaignParticipantsActivitySerializerStub },
      );

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
