import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { learnerParticipationController } from '../../../../../src/prescription/campaign-participation/application/learner-participation-controller.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { ApplicationTransaction } from '../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Learner-Participation', function () {
  describe('#shareCampaignResult', function () {
    let dependencies, userId, campaignParticipationId, request;

    beforeEach(function () {
      userId = Symbol('userId');
      campaignParticipationId = Symbol('campaignParticipationId');
      request = {
        params: {
          campaignParticipationId,
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
      sinon.stub(usecases, 'shareCampaignResult');
      sinon.stub(ApplicationTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      sinon.stub(ApplicationTransaction, 'getTransactionAsDomainTransaction');
    });

    it('should call the use case to share campaign result', async function () {
      // given
      usecases.shareCampaignResult.resolves();

      // when
      await learnerParticipationController.shareCampaignResult(request, hFake, dependencies);

      // then
      expect(usecases.shareCampaignResult).to.have.been.calledOnceWithExactly({ userId, campaignParticipationId });
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
      usecases.startCampaignParticipation.resolves({});
      const deserializedCampaignParticipation = Symbol('campaignParticipation');
      dependencies.campaignParticipationSerializer.deserialize.resolves(deserializedCampaignParticipation);
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      // when
      await learnerParticipationController.save(request, hFake, dependencies);

      // then
      expect(usecases.startCampaignParticipation).to.have.been.calledOnce;

      const args = usecases.startCampaignParticipation.firstCall.args[0];

      expect(args.userId).to.equal(userId);

      const campaignParticipation = args.campaignParticipation;
      expect(campaignParticipation).to.equal(deserializedCampaignParticipation);
    });

    it('should return the serialized campaign participation when it has been successfully created', async function () {
      // given
      const campaignParticipation = domainBuilder.buildCampaignParticipation();
      usecases.startCampaignParticipation.resolves({
        campaignParticipation,
      });
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

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

      sinon.stub(usecases, 'beginCampaignParticipationImprovement');
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
        return lambda();
      });
      usecases.beginCampaignParticipationImprovement.resolves();

      // when
      await learnerParticipationController.beginImprovement(request);

      // then
      expect(usecases.beginCampaignParticipationImprovement).to.have.been.calledOnceWith({
        campaignParticipationId,
        userId,
      });
    });
  });
});
