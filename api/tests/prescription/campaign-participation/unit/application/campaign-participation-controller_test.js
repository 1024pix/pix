import { campaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-controller.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Campaign-Participation', function () {
  describe('#getAnonymisedCampaignAssessments', function () {
    const userId = '1';
    let dependencies;

    beforeEach(function () {
      const anonymisedCampaignAssessmentSerializer = {
        serialize: sinon.stub(),
      };
      sinon.stub(usecases, 'findUserAnonymisedCampaignAssessments');
      dependencies = {
        anonymisedCampaignAssessmentSerializer,
      };
    });

    it('should return serialized anonymised campaign assessments', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            userId: userId,
          },
        },
        params: {
          id: userId,
        },
      };
      const serializeSymbol = Symbol('serialize');
      usecases.findUserAnonymisedCampaignAssessments.withArgs({ userId }).resolves([]);
      dependencies.anonymisedCampaignAssessmentSerializer.serialize.withArgs([]).returns(serializeSymbol);

      // when
      const response = await campaignParticipationController.getAnonymisedCampaignAssessments(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response).to.equal(serializeSymbol);
      expect(dependencies.anonymisedCampaignAssessmentSerializer.serialize).to.have.been.calledOnce;
    });
  });

  describe('#getCampaignParticipationOverviews', function () {
    const userId = '1';
    let dependencies;

    beforeEach(function () {
      const campaignParticipationOverviewSerializer = {
        serialize: sinon.stub(),
        serializeForPaginatedList: sinon.stub(),
      };
      sinon.stub(usecases, 'findUserCampaignParticipationOverviews');
      dependencies = {
        campaignParticipationOverviewSerializer,
      };
    });

    it('should return serialized campaignParticipationOverviews', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            userId: userId,
          },
        },
        params: {
          id: userId,
        },
        query: { filter: {}, page: {} },
      };
      usecases.findUserCampaignParticipationOverviews.withArgs({ userId, states: undefined, page: {} }).resolves([]);
      dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList.withArgs([]).returns({
        id: 'campaignParticipationOverviews',
      });

      // when
      const response = await campaignParticipationController.getCampaignParticipationOverviews(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response).to.deep.equal({
        id: 'campaignParticipationOverviews',
      });
      expect(dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList).to.have.been.calledOnce;
    });

    it('should forward state and page query parameters', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            userId: userId,
          },
        },
        params: {
          id: userId,
        },
        query: {
          filter: {
            states: 'ONGOING',
          },
          page: { number: 1, size: 10 },
        },
      };
      usecases.findUserCampaignParticipationOverviews
        .withArgs({ userId, states: 'ONGOING', page: { number: 1, size: 10 } })
        .resolves([]);
      dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList.withArgs([]).returns({
        id: 'campaignParticipationOverviews',
      });

      // when
      const response = await campaignParticipationController.getCampaignParticipationOverviews(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response).to.deep.equal({
        id: 'campaignParticipationOverviews',
      });
      expect(dependencies.campaignParticipationOverviewSerializer.serializeForPaginatedList).to.have.been.calledOnce;
    });
  });

  describe('#getCampaignAssessmentParticipationResult', function () {
    let dependencies;
    const campaignId = 123;
    const userId = 456;
    const campaignParticipationId = 789;
    const locale = FRENCH_SPOKEN;

    beforeEach(function () {
      sinon.stub(usecases, 'getCampaignAssessmentParticipationResult');
      const campaignAssessmentParticipationResultSerializer = {
        serialize: sinon.stub(),
      };
      dependencies = {
        campaignAssessmentParticipationResultSerializer,
      };
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignAssessmentParticipationResult = Symbol('campaignAssessmentParticipationResult');
      const expectedResults = Symbol('results');
      usecases.getCampaignAssessmentParticipationResult
        .withArgs({ userId, campaignId, campaignParticipationId, locale })
        .resolves(campaignAssessmentParticipationResult);
      dependencies.campaignAssessmentParticipationResultSerializer.serialize
        .withArgs(campaignAssessmentParticipationResult)
        .returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignId, campaignParticipationId },
        headers: { 'accept-language': locale },
      };
      const h = Symbol('h');

      // when
      const response = await campaignParticipationController.getCampaignAssessmentParticipationResult(
        request,
        h,
        dependencies,
      );

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#getCampaignProfile', function () {
    let dependencies;
    const campaignId = 123;
    const userId = 456;
    const campaignParticipationId = 789;
    const locale = FRENCH_SPOKEN;

    beforeEach(function () {
      sinon.stub(usecases, 'getCampaignProfile');
      const campaignProfileSerializer = {
        serialize: sinon.stub(),
      };
      dependencies = {
        campaignProfileSerializer,
      };
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignProfile = Symbol('campaignProfile');
      const expectedResults = Symbol('results');
      usecases.getCampaignProfile
        .withArgs({ userId, campaignId, campaignParticipationId, locale })
        .resolves(campaignProfile);
      dependencies.campaignProfileSerializer.serialize.withArgs(campaignProfile).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignId, campaignParticipationId },
        headers: { 'accept-language': locale },
      };
      const h = Symbol('h');

      // when
      const response = await campaignParticipationController.getCampaignProfile(request, h, dependencies);

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#getAnalysis', function () {
    let dependencies;
    const userId = 456;
    const campaignParticipationId = 789;
    const locale = FRENCH_SPOKEN;

    beforeEach(function () {
      sinon.stub(usecases, 'computeCampaignParticipationAnalysis');
      const campaignAnalysisSerializer = {
        serialize: sinon.stub(),
      };
      dependencies = {
        campaignAnalysisSerializer,
      };
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignAnalysis = Symbol('campaignAnalysis');
      const expectedResults = Symbol('results');
      usecases.computeCampaignParticipationAnalysis
        .withArgs({ userId, campaignParticipationId, locale })
        .resolves(campaignAnalysis);
      dependencies.campaignAnalysisSerializer.serialize.withArgs(campaignAnalysis).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignParticipationId },
        headers: { 'accept-language': locale },
      };
      const h = Symbol('h');

      // when
      const response = await campaignParticipationController.getAnalysis(request, h, dependencies);

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#getCampaignParticipationsForOrganizationLearner', function () {
    const campaignId = 123;
    const organizationLearnerId = 456;
    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'getCampaignParticipationsForOrganizationLearner');
      const availableCampaignParticipationsSerializer = {
        serialize: sinon.stub(),
      };
      dependencies = {
        availableCampaignParticipationsSerializer,
      };
    });

    it('should call the usecase with correct parameter', async function () {
      // given
      const availableCampaignParticipations = Symbol('availableCampaignParticipations');
      const expectedResults = Symbol('results');
      usecases.getCampaignParticipationsForOrganizationLearner
        .withArgs({ campaignId, organizationLearnerId })
        .resolves(availableCampaignParticipations);

      dependencies.availableCampaignParticipationsSerializer.serialize
        .withArgs(availableCampaignParticipations)
        .returns(expectedResults);

      const request = {
        params: { campaignId, organizationLearnerId },
      };
      const h = Symbol('h');
      // when
      const response = await campaignParticipationController.getCampaignParticipationsForOrganizationLearner(
        request,
        h,
        dependencies,
      );

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#updateParticipantExternalId', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'updateParticipantExternalId');
    });

    it('should call usecase and serializer with expected parameters', async function () {
      //given
      const request = {
        params: {
          id: 123,
        },
        payload: {
          data: {
            attributes: {
              'participant-external-id': 'Pixer123',
            },
          },
        },
      };
      // when
      const response = await campaignParticipationController.updateParticipantExternalId(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecases.updateParticipantExternalId).to.have.been.calledOnce;
      expect(usecases.updateParticipantExternalId).to.have.been.calledWithMatch({
        campaignParticipationId: 123,
        participantExternalId: 'Pixer123',
      });
    });
  });

  describe('#getUserCampaignAssessmentResult', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'getUserCampaignAssessmentResult');
    });

    it('should call usecase and serializer with expected parameters', async function () {
      //given
      const locale = Symbol('locale');
      const userId = Symbol('userId');
      const campaignId = Symbol('campaignId');

      const expectedResult = Symbol('expectedResult');
      const serializedResult = Symbol('serializedResult');

      const request = {
        auth: { credentials: { userId } },
        params: { campaignId },
      };
      const dependencies = {
        extractLocaleFromRequest: sinon.stub(),
        participantResultSerializer: { serialize: sinon.stub() },
      };
      usecases.getUserCampaignAssessmentResult.withArgs({ locale, userId, campaignId }).returns(expectedResult);
      dependencies.extractLocaleFromRequest.withArgs(request).returns(locale);
      dependencies.participantResultSerializer.serialize.withArgs(expectedResult).returns(serializedResult);

      // when
      const response = await campaignParticipationController.getUserCampaignAssessmentResult(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response).to.be.equal(serializedResult);
    });
  });

  describe('#deleteParticipation', function () {
    it('should call the usecase to delete the campaignParticipation', async function () {
      // given
      const campaignParticipationId = 1;
      const campaignId = 6;
      const userId = 2;
      const request = {
        params: { campaignId, campaignParticipationId },
        auth: { credentials: { userId } },
      };

      sinon.stub(usecases, 'deleteCampaignParticipation');
      usecases.deleteCampaignParticipation.resolves();

      // when
      await campaignParticipationController.deleteParticipation(request, hFake);

      // then
      expect(usecases.deleteCampaignParticipation).to.have.been.calledOnceWith({
        campaignParticipationId,
        campaignId,
        userId,
        userRole: 'ORGA_ADMIN',
        client: 'PIX_ORGA',
      });
    });
  });

  describe('#deleteParticipationFromAdmin', function () {
    it('should call the usecase to delete the campaignParticipation', async function () {
      // given
      const campaignParticipationId = 1;
      const campaignId = 6;
      const userId = 2;
      const request = {
        params: { campaignId, campaignParticipationId },
        auth: { credentials: { userId } },
      };

      sinon.stub(usecases, 'deleteCampaignParticipation');
      usecases.deleteCampaignParticipation.resolves();

      // when
      await campaignParticipationController.deleteParticipationFromAdmin(request, hFake);

      // then
      expect(usecases.deleteCampaignParticipation).to.have.been.calledOnceWith({
        campaignParticipationId,
        campaignId,
        userId,
        userRole: 'SUPER_ADMIN',
        client: 'PIX_ADMIN',
      });
    });
  });

  describe('#getUserCampaignParticipationToCampaign', function () {
    it('should return serialized campaign participation', async function () {
      // given
      const userId = 789;
      const campaignId = 456;
      const campaignParticipation = Symbol('campaign participation');
      const expectedCampaignParticipation = Symbol('expected campaign participation');

      const request = {
        auth: {
          credentials: {
            userId,
          },
        },
        params: {
          userId,
          campaignId,
        },
      };
      const campaignParticipationSerializer = { serialize: sinon.stub() };
      sinon.stub(usecases, 'getUserCampaignParticipationToCampaign');
      usecases.getUserCampaignParticipationToCampaign.withArgs({ userId, campaignId }).resolves(campaignParticipation);
      campaignParticipationSerializer.serialize.withArgs(campaignParticipation).returns(expectedCampaignParticipation);

      // when
      const response = await campaignParticipationController.getUserCampaignParticipationToCampaign(request, hFake, {
        campaignParticipationSerializer,
      });

      // then
      expect(response).to.equal(expectedCampaignParticipation);
    });
  });
});
