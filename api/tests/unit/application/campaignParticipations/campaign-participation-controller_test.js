const { sinon, expect, domainBuilder, hFake } = require('../../../test-helper');

const campaignParticipationController = require('../../../../lib/application/campaignParticipations/campaign-participation-controller');
const serializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils');
const events = require('../../../../lib/domain/events');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const CampaignParticipationResultsShared = require('../../../../lib/domain/events/CampaignParticipationResultsShared');
const CampaignParticipationStarted = require('../../../../lib/domain/events/CampaignParticipationStarted');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Unit | Application | Controller | Campaign-Participation', () => {

  describe('#find', () => {

    let options;

    const query = 'some query';
    const userId = 1;
    const authorization = 'auth header';
    const request = {
      headers: { authorization },
      auth: {
        credentials: {
          userId,
        },
      },
      query,
    };
    const resultWithPagination = { models: [], pagination: {} };
    const result = [];
    const serialized = {};

    const assessmentId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'findCampaignParticipationsRelatedToAssessment');
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(serializer, 'serialize')
        .withArgs(resultWithPagination.models, resultWithPagination.pagination).returns(serialized)
        .withArgs(result).returns(serialized);
    });

    it('should call the usecases to get the user campaign participation', async () => {
      // given
      options = { filter: { assessmentId }, include: [] };

      queryParamsUtils.extractParameters.withArgs(query).returns(options);
      usecases.findCampaignParticipationsRelatedToAssessment.withArgs({ userId, assessmentId }).resolves(result);

      // when
      const response = await campaignParticipationController.find(request, hFake);

      // then
      expect(response).to.deep.equal(serialized);
    });
  });

  describe('#shareCampaignResult', () => {
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

    beforeEach(() => {
      sinon.stub(usecases, 'shareCampaignResult');
      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest').returns(userId);
    });

    it('should call the use case to share campaign result', async () => {
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

    it('should dispatch the campaign participation results shared event', async () => {
      // given
      const campaignParticipationResultsSharedEvent = new CampaignParticipationResultsShared();
      usecases.shareCampaignResult.resolves(campaignParticipationResultsSharedEvent);
      sinon.stub(events.eventDispatcher, 'dispatch');

      // when
      await campaignParticipationController.shareCampaignResult(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(campaignParticipationResultsSharedEvent);
    });

    context('when the request comes from a different user', () => {

      it('should return a 403 status code', async () => {
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

  describe('#save', () => {
    let request;
    const campaignId = 123456;
    const participantExternalId = 'azer@ty.com';
    const userId = 6;

    beforeEach(() => {
      sinon.stub(usecases, 'startCampaignParticipation');
      sinon.stub(serializer, 'serialize');
      sinon.stub(events.eventDispatcher, 'dispatch');
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
              'campaign': {
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

    it('should call the usecases to start the campaign participation', async () => {
      // given
      usecases.startCampaignParticipation.resolves(new CampaignParticipationStarted());
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

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

    it('should dispatch CampaignParticipationStartedEvent', async () => {
      // given
      const campaignParticipationStartedEvent = new CampaignParticipationStarted();
      usecases.startCampaignParticipation.resolves({ event: campaignParticipationStartedEvent });
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      // when
      await campaignParticipationController.save(request, hFake);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWith(campaignParticipationStartedEvent);
    });

    it('should return the serialized campaign participation when it has been successfully created', async () => {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation();
      usecases.startCampaignParticipation.resolves({
        event: new CampaignParticipationStarted({ campaignParticipationId: campaignParticipation.id }),
        campaignParticipation,
      });
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      const serializedCampaignParticipation = { id: 88, assessmentId: 12 };
      serializer.serialize.returns(serializedCampaignParticipation);

      // when
      const response = await campaignParticipationController.save(request, hFake);

      // then
      expect(serializer.serialize).to.have.been.calledWith(campaignParticipation);
      expect(response.statusCode).to.equal(201);
      expect(response.source).to.deep.equal(serializedCampaignParticipation);
    });
  });

  describe('#getById', () => {
    const campaignParticipationId = 1;
    const userId = 1;
    let request, options, query;

    beforeEach(() => {
      query = { include: 'user' };
      request = {
        params: {
          id: campaignParticipationId,
        },
        auth: {
          credentials: { userId },
        },
        query,
      };

      options = { include: ['user'] };

      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'getCampaignParticipation');
      sinon.stub(serializer, 'serialize');
    });

    it('should return the campaignParticipation', async () => {
      // given
      queryParamsUtils.extractParameters.withArgs(query).returns(options);
      usecases.getCampaignParticipation.withArgs({ campaignParticipationId, options, userId }).resolves({});
      serializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignParticipationController.getById(request);

      // then
      expect(response).to.equal('ok');
    });
  });

  describe('#beginImprovement', () => {

    it('should call the usecase to begin improvement', async () => {
      // given
      const campaignParticipationId = 1;
      const userId = 2;
      const request = {
        params: { id: campaignParticipationId },
        auth: { credentials: { userId } },
      };
      sinon.stub(usecases, 'beginCampaignParticipationImprovement');
      usecases.beginCampaignParticipationImprovement
        .resolves();

      // when
      await campaignParticipationController.beginImprovement(request);

      // then
      expect(usecases.beginCampaignParticipationImprovement).to.have.been.calledOnceWith({ campaignParticipationId, userId });
    });
  });
});
