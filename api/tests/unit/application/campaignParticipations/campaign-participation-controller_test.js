const { sinon, expect, domainBuilder, hFake, catchErr } = require('../../../test-helper');

const { BadRequestError } = require('../../../../lib/application/http-errors');
const campaignParticipationController = require('../../../../lib/application/campaignParticipations/campaign-participation-controller');
const serializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Application | Controller | Campaign-Participation', () => {

  describe('#find', () => {

    let options;

    const query = 'some query';
    const userId = 1;
    const authorization = 'auth header';
    const request = {
      headers: { authorization },
      auth: {
        credentials : {
          userId
        }
      },
      query
    };
    const resultWithPagination = { models: [], pagination: {} };
    const result = [];
    const serialized = {};

    const assessmentId = 1;
    const campaignId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'findCampaignParticipationsRelatedToAssessment');
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(serializer, 'serialize')
        .withArgs(resultWithPagination.models, resultWithPagination.pagination).returns(serialized)
        .withArgs(result).returns(serialized);
      sinon.stub(usecases, 'findCampaignParticipationsWithResults');
    });

    context('when the request contains just assessmentId filter', () => {
      it('should call the usecases to get the user campaign participation', async () => {
        // given
        options = { filter: { assessmentId } , include: [] };

        queryParamsUtils.extractParameters.withArgs(query).returns(options);
        usecases.findCampaignParticipationsRelatedToAssessment.withArgs({ userId, assessmentId }).resolves(result);

        // when
        const response = await campaignParticipationController.find(request, hFake);

        // then
        expect(response).to.deep.equal(serialized);
      });
    });

    context('when the request does not contain any filter', () => {
      it('should throw a bad request error', async () => {
        // given
        options = { filter: {}, include: [] };

        queryParamsUtils.extractParameters.withArgs(query).returns(options);
        usecases.findCampaignParticipationsRelatedToAssessment.withArgs({ userId, assessmentId }).resolves(resultWithPagination);

        // when
        const responseErr = await catchErr(campaignParticipationController.find)(request, hFake);

        // then
        expect(responseErr).to.be.instanceOf(BadRequestError);
      });
    });

    context('when the request contains both a campaignId and an include campaigns-participation-result', () => {
      it('should call the usecases to get the user campaign participation', async () => {
        // given
        options = { filter: { campaignId, assessmentId }, include: ['campaign-participation-result'] };

        queryParamsUtils.extractParameters.withArgs(query).returns(options);
        usecases.findCampaignParticipationsWithResults.withArgs({ userId, options }).resolves(resultWithPagination);

        // when
        const response = await campaignParticipationController.find(request, hFake);

        // then
        expect(response).to.deep.equal(serialized);
      });
    });

  });

  describe('#shareCampaignResult', () => {
    const userId = 1;
    const request = {
      params: {
        id: '5'
      },
      headers: {
        authorization: 'token'
      },
      auth: {
        credentials : {
          userId
        }
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
                }
              }
            }
          }
        }
      };
    });

    it('should call the usecases to start the campaign participation', async () => {
      // given
      usecases.startCampaignParticipation.resolves();

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

    it('should return the serialized campaign participation when it has been successfully created', async () => {
      // given
      const createdCampaignParticipation = domainBuilder.buildCampaignParticipation();
      usecases.startCampaignParticipation.resolves(createdCampaignParticipation);

      const serializedCampaignParticipation = { id: 88, assessmentId: 12 };
      serializer.serialize.returns(serializedCampaignParticipation);

      // when
      const response = await campaignParticipationController.save(request, hFake);

      // then
      expect(serializer.serialize).to.have.been.calledWith(createdCampaignParticipation);
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
          credentials: { userId }
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
    const campaignParticipationId = 1;
    const userId = 1;
    let request;

    beforeEach(() => {
      request = {
        params: { id: campaignParticipationId, },
        auth: { credentials: { userId } },
      };

      sinon.stub(usecases, 'beginCampaignParticipationImprovement');
      sinon.stub(serializer, 'serialize');
    });

    it('should return an improving campaignParticipation', async () => {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation({ id: campaignParticipationId, userId });
      usecases.beginCampaignParticipationImprovement
        .withArgs({ campaignParticipationId, userId })
        .resolves(campaignParticipation);

      const serializedCampaignParticipation = { id: campaignParticipationId, userId };
      serializer.serialize
        .withArgs(campaignParticipation)
        .returns(serializedCampaignParticipation);

      // when
      const response = await campaignParticipationController.beginImprovement(request);

      // then
      expect(usecases.beginCampaignParticipationImprovement).to.have.been.calledOnce;
      expect(response).to.deep.equal(serializedCampaignParticipation);
    });
  });
});
