import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { campaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-controller.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { LOCALE } from '../../../../../src/shared/domain/constants.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

const { FRENCH_SPOKEN } = LOCALE;
describe('Unit | Application | Controller | Campaign-Participation', function () {
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
        params: { id: campaignParticipationId },
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

  describe('#deleteParticipation', function () {
    it('should call the usecase to delete the campaignParticipation', async function () {
      // given
      const campaignParticipationId = 1;
      const campaignId = 6;
      const userId = 2;
      const request = {
        params: { id: campaignId, campaignParticipationId },
        auth: { credentials: { userId } },
      };

      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda();
      });
      sinon.stub(usecases, 'deleteCampaignParticipation');
      usecases.deleteCampaignParticipation.resolves();

      // when
      await campaignParticipationController.deleteParticipation(request, hFake);

      // then
      expect(usecases.deleteCampaignParticipation).to.have.been.calledOnceWith({
        campaignParticipationId,
        campaignId,
        userId,
      });
    });
  });
});
