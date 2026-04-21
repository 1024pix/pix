import sinon from 'sinon';

import { learnerParticipationController } from '../../../../../src/prescription/campaign-participation/application/learner-participation-controller.js';
import { usecases } from '../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Application | Controller | Learner-Participation', function () {
  describe('#shareCampaignResult', function () {
    let userId, campaignParticipationId, request;

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
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });
      sinon.stub(DomainTransaction, 'getConnection');
    });

    it('should call the usecase to share campaign result and get results for a possible quest', async function () {
      // given
      usecases.shareCampaignResult.resolves();

      // when
      await learnerParticipationController.shareCampaignResult(request, hFake);

      // then
      expect(usecases.shareCampaignResult).to.have.been.calledOnceWithExactly({ userId, campaignParticipationId });
    });

    context('when the request comes from a different user', function () {
      it('should return a 403 status code', async function () {
        // given
        usecases.shareCampaignResult.resolves();

        // when
        await learnerParticipationController.shareCampaignResult(request, hFake);

        // then
        expect(usecases.shareCampaignResult).to.have.been.calledOnce;
        const updateCampaignParticipation = usecases.shareCampaignResult.firstCall.args[0];
        expect(updateCampaignParticipation).to.have.property('campaignParticipationId');
        expect(updateCampaignParticipation).to.have.property('userId');
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

      const loggerStub = {
        error: sinon.stub(),
      };

      dependencies = {
        campaignParticipationSerializer: campaignParticipationSerializerStub,
        logger: loggerStub,
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

  describe('#getSharedCampaignParticipationProfile', function () {
    let campaignId, dependencies, locale, request, sharedProfileForCampaignSerializerStub, userId;

    beforeEach(function () {
      sinon.stub(usecases, 'getSharedCampaignParticipationProfile');
      campaignId = Symbol('campaignId');
      userId = Symbol('userId');
      locale = 'fr';

      sharedProfileForCampaignSerializerStub = {
        serialize: sinon.stub(),
      };
      dependencies = {
        sharedProfileForCampaignSerializer: sharedProfileForCampaignSerializerStub,
      };

      request = {
        params: { campaignId },
        auth: { credentials: { userId } },
        state: { locale },
      };
    });

    it('should call the usecase to get learner shared profile', async function () {
      // given
      usecases.getSharedCampaignParticipationProfile.resolves({});
      const serializedCampaignProfileShared = Symbol('campaignProfileShared');
      dependencies.sharedProfileForCampaignSerializer.serialize.resolves(serializedCampaignProfileShared);
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      // when
      await learnerParticipationController.getSharedCampaignParticipationProfile(request, hFake, dependencies);

      // then
      expect(usecases.getSharedCampaignParticipationProfile).to.have.been.calledOnceWith({
        campaignId,
        userId,
        locale,
      });
    });
  });
});
