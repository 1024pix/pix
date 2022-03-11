const { sinon, expect, domainBuilder, hFake } = require('../../../test-helper');

const campaignParticipationController = require('../../../../lib/application/campaign-participations/campaign-participation-controller');
const campaignAnalysisSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-analysis-serializer');
const campaignAssessmentParticipationResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-assessment-participation-result-serializer');
const campaignParticipationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const campaignProfileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-profile-serializer');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils');
const events = require('../../../../lib/domain/events');
const usecases = require('../../../../lib/domain/usecases');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');
const { FRENCH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;
const monitoringTools = require('../../../../lib/infrastructure/monitoring-tools');

describe('Unit | Application | Controller | Campaign-Participation', function () {
  describe('#shareCampaignResult', function () {
    const userId = 1;
    const request = {
      params: {
        id: '5',
      },
      headers: {
        authorization: 'token',
      },
      auth: {
        credentials: {
          userId,
        },
      },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'shareCampaignResult');
      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest').returns(userId);
      sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
    });

    it('should call the use case to share campaign result', async function () {
      // given
      usecases.shareCampaignResult.resolves();

      // when
      await campaignParticipationController.shareCampaignResult(request, hFake);

      // then
      expect(usecases.shareCampaignResult).to.have.been.calledOnce;
      const updateCampaignParticiaption = usecases.shareCampaignResult.firstCall.args[0];
      expect(updateCampaignParticiaption).to.have.property('campaignParticipationId');
      expect(updateCampaignParticiaption).to.have.property('userId');
    });

    it('should dispatch the campaign participation results shared event', async function () {
      // given
      const campaignParticipationResultsSharedEvent = new CampaignParticipationResultsShared();
      usecases.shareCampaignResult.resolves(campaignParticipationResultsSharedEvent);
      sinon.stub(events.eventDispatcher, 'dispatch');
      events.eventDispatcher.dispatch.resolves();

      // when
      await campaignParticipationController.shareCampaignResult(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(campaignParticipationResultsSharedEvent);
    });

    it('should return an empty response and log an error if the campaign participation results shared event handler failed', async function () {
      // given
      const campaignParticipationResultsSharedEvent = new CampaignParticipationResultsShared();
      usecases.shareCampaignResult.resolves(campaignParticipationResultsSharedEvent);
      sinon.stub(events.eventDispatcher, 'dispatch');
      events.eventDispatcher.dispatch.resolves();
      const errorInHandler = new Error('handlePoleEmploiParticipationShared failed with an error');
      events.eventDispatcher.dispatch.rejects(errorInHandler);

      // when
      await campaignParticipationController.shareCampaignResult(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(campaignParticipationResultsSharedEvent);
      expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({ message: errorInHandler });
    });

    context('when the request comes from a different user', function () {
      it('should return a 403 status code', async function () {
        // given
        usecases.shareCampaignResult.resolves();

        // when
        await campaignParticipationController.shareCampaignResult(request, hFake);

        // then
        expect(usecases.shareCampaignResult).to.have.been.calledOnce;
        const updateCampaignParticiaption = usecases.shareCampaignResult.firstCall.args[0];
        expect(updateCampaignParticiaption).to.have.property('campaignParticipationId');
        expect(updateCampaignParticiaption).to.have.property('userId');
      });
    });
  });

  describe('#save', function () {
    let request;
    const campaignId = 123456;
    const participantExternalId = 'azer@ty.com';
    const userId = 6;

    beforeEach(function () {
      sinon.stub(usecases, 'startCampaignParticipation');
      sinon.stub(campaignParticipationSerializer, 'serialize');
      sinon.stub(events.eventDispatcher, 'dispatch');
      sinon.stub(monitoringTools, 'logErrorWithCorrelationIds');
      request = {
        headers: { authorization: 'token' },
        auth: { credentials: { userId } },
        payload: {
          data: {
            type: 'campaign-participations',
            attributes: {
              'participant-external-id': participantExternalId,
            },
            relationships: {
              campaign: {
                data: {
                  id: campaignId,
                  type: 'campaigns',
                },
              },
            },
          },
        },
      };
    });

    it('should call the usecases to start the campaign participation', async function () {
      // given
      usecases.startCampaignParticipation.resolves(new CampaignParticipationStarted());
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      events.eventDispatcher.dispatch.resolves();

      // when
      await campaignParticipationController.save(request, hFake);

      // then
      expect(usecases.startCampaignParticipation).to.have.been.calledOnce;

      const args = usecases.startCampaignParticipation.firstCall.args[0];

      expect(args.userId).to.equal(userId);

      const campaignParticipation = args.campaignParticipation;
      expect(campaignParticipation).to.have.property('campaignId', campaignId);
      expect(campaignParticipation).to.have.property('participantExternalId', participantExternalId);
    });

    it('should dispatch CampaignParticipationStartedEvent', async function () {
      // given
      const campaignParticipationStartedEvent = new CampaignParticipationStarted();
      usecases.startCampaignParticipation.resolves({ event: campaignParticipationStartedEvent });
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      events.eventDispatcher.dispatch.resolves();

      // when
      await campaignParticipationController.save(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(campaignParticipationStartedEvent);
    });

    it('should return the serialized campaign participation when it has been successfully created', async function () {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation();
      usecases.startCampaignParticipation.resolves({
        event: new CampaignParticipationStarted({ campaignParticipationId: campaignParticipation.id }),
        campaignParticipation,
      });
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      events.eventDispatcher.dispatch.resolves();

      const serializedCampaignParticipation = { id: 88, assessmentId: 12 };
      campaignParticipationSerializer.serialize.returns(serializedCampaignParticipation);

      // when
      const response = await campaignParticipationController.save(request, hFake);

      // then
      expect(campaignParticipationSerializer.serialize).to.have.been.calledWith(campaignParticipation);
      expect(response.statusCode).to.equal(201);
      expect(response.source).to.deep.equal(serializedCampaignParticipation);
    });

    it('should log an error, return the serialized campaign participation when it has been successfully created even if the handler throw an error', async function () {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation();
      usecases.startCampaignParticipation.resolves({
        event: new CampaignParticipationStarted({ campaignParticipationId: campaignParticipation.id }),
        campaignParticipation,
      });
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      const errorInHandler = new Error('handlePoleEmploiParticipationStarted failed with an error');
      events.eventDispatcher.dispatch.rejects(errorInHandler);

      const serializedCampaignParticipation = { id: 88, assessmentId: 12 };
      campaignParticipationSerializer.serialize.returns(serializedCampaignParticipation);

      // when
      const response = await campaignParticipationController.save(request, hFake);

      // then
      expect(monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWith({ message: errorInHandler });
      expect(campaignParticipationSerializer.serialize).to.have.been.calledWith(campaignParticipation);
      expect(response.statusCode).to.equal(201);
      expect(response.source).to.deep.equal(serializedCampaignParticipation);
    });
  });

  describe('#beginImprovement', function () {
    it('should call the usecase to begin improvement', async function () {
      // given
      const campaignParticipationId = 1;
      const userId = 2;
      const request = {
        params: { id: campaignParticipationId },
        auth: { credentials: { userId } },
      };
      const domainTransaction = Symbol();

      sinon.stub(usecases, 'beginCampaignParticipationImprovement');
      DomainTransaction.execute = (lambda) => {
        return lambda(domainTransaction);
      };
      usecases.beginCampaignParticipationImprovement.resolves();

      // when
      await campaignParticipationController.beginImprovement(request);

      // then
      expect(usecases.beginCampaignParticipationImprovement).to.have.been.calledOnceWith({
        campaignParticipationId,
        userId,
        domainTransaction,
      });
    });
  });

  describe('#getCampaignAssessmentParticipationResult', function () {
    const campaignId = 123;
    const userId = 456;
    const campaignParticipationId = 789;
    const locale = FRENCH_SPOKEN;

    beforeEach(function () {
      sinon.stub(usecases, 'getCampaignAssessmentParticipationResult');
      sinon.stub(campaignAssessmentParticipationResultSerializer, 'serialize');
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignAssessmentParticipationResult = Symbol('campaignAssessmentParticipationResult');
      const expectedResults = Symbol('results');
      usecases.getCampaignAssessmentParticipationResult
        .withArgs({ userId, campaignId, campaignParticipationId, locale })
        .resolves(campaignAssessmentParticipationResult);
      campaignAssessmentParticipationResultSerializer.serialize
        .withArgs(campaignAssessmentParticipationResult)
        .returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignId, campaignParticipationId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignParticipationController.getCampaignAssessmentParticipationResult(request);

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#getCampaignProfile', function () {
    const campaignId = 123;
    const userId = 456;
    const campaignParticipationId = 789;
    const locale = FRENCH_SPOKEN;

    beforeEach(function () {
      sinon.stub(usecases, 'getCampaignProfile');
      sinon.stub(campaignProfileSerializer, 'serialize');
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignProfile = Symbol('campaignProfile');
      const expectedResults = Symbol('results');
      usecases.getCampaignProfile
        .withArgs({ userId, campaignId, campaignParticipationId, locale })
        .resolves(campaignProfile);
      campaignProfileSerializer.serialize.withArgs(campaignProfile).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { campaignId, campaignParticipationId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignParticipationController.getCampaignProfile(request);

      // then
      expect(response).to.equal(expectedResults);
    });
  });

  describe('#getAnalysis', function () {
    const userId = 456;
    const campaignParticipationId = 789;
    const locale = FRENCH_SPOKEN;

    beforeEach(function () {
      sinon.stub(usecases, 'computeCampaignParticipationAnalysis');
      sinon.stub(campaignAnalysisSerializer, 'serialize');
    });

    it('should call usecase and serializer with expected parameters', async function () {
      // given
      const campaignAnalysis = Symbol('campaignAnalysis');
      const expectedResults = Symbol('results');
      usecases.computeCampaignParticipationAnalysis
        .withArgs({ userId, campaignParticipationId, locale })
        .resolves(campaignAnalysis);
      campaignAnalysisSerializer.serialize.withArgs(campaignAnalysis).returns(expectedResults);

      const request = {
        auth: { credentials: { userId } },
        params: { id: campaignParticipationId },
        headers: { 'accept-language': locale },
      };

      // when
      const response = await campaignParticipationController.getAnalysis(request);

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
});
