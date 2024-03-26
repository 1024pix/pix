import { CampaignParticipationResultsShared } from '../../../../../lib/domain/events/CampaignParticipationResultsShared.js';
import { CampaignParticipationStarted } from '../../../../../lib/domain/events/CampaignParticipationStarted.js';
import * as events from '../../../../../lib/domain/events/index.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { learnerParticipationController } from '../../../../../src/prescription/campaign-participation/application/learner-participation-controller.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { ApplicationTransaction } from '../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Campaign-Participation', function () {
  describe('#shareCampaignResult', function () {
    let dependencies;
    const userId = 1;
    const request = {
      params: {
        campaignParticipationId: '5',
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

      sinon.stub(events.eventBus, 'publish');
      const requestResponseUtilsStub = {
        extractUserIdFromRequest: sinon.stub(),
      };
      requestResponseUtilsStub.extractUserIdFromRequest.returns(userId);

      const monitoringToolsStub = {
        logErrorWithCorrelationIds: sinon.stub(),
      };
      sinon.stub(ApplicationTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      sinon.stub(ApplicationTransaction, 'getTransactionAsDomainTransaction');

      dependencies = {
        requestResponseUtils: requestResponseUtilsStub,
        monitoringTools: monitoringToolsStub,
      };
    });

    it('should call the use case to share campaign result', async function () {
      // given
      usecases.shareCampaignResult.resolves();

      // when
      await learnerParticipationController.shareCampaignResult(request, hFake, dependencies);

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
      const domainTransaction = Symbol('domainTransaction');
      ApplicationTransaction.getTransactionAsDomainTransaction.returns(domainTransaction);

      // when
      await learnerParticipationController.shareCampaignResult(request, hFake, dependencies);

      // then
      expect(events.eventBus.publish).to.have.been.calledWithExactly(
        campaignParticipationResultsSharedEvent,
        domainTransaction,
      );
    });

    context('when the request comes from a different user', function () {
      it('should return a 403 status code', async function () {
        // given
        usecases.shareCampaignResult.resolves();

        // when
        await learnerParticipationController.shareCampaignResult(request, hFake, dependencies);

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
    let dependencies;
    const campaignId = 123456;
    const participantExternalId = 'azer@ty.com';
    const userId = 6;

    beforeEach(function () {
      sinon.stub(usecases, 'startCampaignParticipation');

      const campaignParticipationSerializerStub = {
        serialize: sinon.stub(),
        deserialize: sinon.stub(),
      };

      const monitoringToolsStub = {
        logErrorWithCorrelationIds: sinon.stub(),
      };

      dependencies = {
        campaignParticipationSerializer: campaignParticipationSerializerStub,
        monitoringTools: monitoringToolsStub,
      };

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
      const deserializedCampaignParticipation = Symbol('campaignParticipation');
      dependencies.campaignParticipationSerializer.deserialize.resolves(deserializedCampaignParticipation);
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      events.eventDispatcher.dispatch.resolves();

      // when
      await learnerParticipationController.save(request, hFake, dependencies);

      // then
      expect(usecases.startCampaignParticipation).to.have.been.calledOnce;

      const args = usecases.startCampaignParticipation.firstCall.args[0];

      expect(args.userId).to.equal(userId);

      const campaignParticipation = args.campaignParticipation;
      expect(campaignParticipation).to.equal(deserializedCampaignParticipation);
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
      await learnerParticipationController.save(request, hFake, dependencies);

      // then
      expect(events.eventDispatcher.dispatch).to.have.been.calledWithExactly(campaignParticipationStartedEvent);
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
      dependencies.campaignParticipationSerializer.serialize.returns(serializedCampaignParticipation);

      // when
      const response = await learnerParticipationController.save(request, hFake, dependencies);

      // then
      expect(dependencies.campaignParticipationSerializer.serialize).to.have.been.calledWithExactly(
        campaignParticipation,
      );
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
      dependencies.campaignParticipationSerializer.serialize.returns(serializedCampaignParticipation);

      // when
      const response = await learnerParticipationController.save(request, hFake, dependencies);

      // then
      expect(dependencies.monitoringTools.logErrorWithCorrelationIds).to.have.been.calledWithExactly({
        message: errorInHandler,
      });
      expect(dependencies.campaignParticipationSerializer.serialize).to.have.been.calledWithExactly(
        campaignParticipation,
      );
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
        params: { campaignParticipationId },
        auth: { credentials: { userId } },
      };
      const domainTransaction = Symbol();

      sinon.stub(usecases, 'beginCampaignParticipationImprovement');
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda(domainTransaction);
      });
      usecases.beginCampaignParticipationImprovement.resolves();

      // when
      await learnerParticipationController.beginImprovement(request);

      // then
      expect(usecases.beginCampaignParticipationImprovement).to.have.been.calledOnceWith({
        campaignParticipationId,
        userId,
        domainTransaction,
      });
    });
  });
});
