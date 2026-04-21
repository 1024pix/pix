import boom from '@hapi/boom';
import sinon from 'sinon';

import { campaignParticipationPreHandlers } from '../../../../../src/prescription/campaign-participation/application/pre-handlers.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Prescription | Campaign Participation | Application | pre handlers', function () {
  describe('#checkUserCanAccessCampaignParticipation', function () {
    it('calls continue when campaign is linked to an organization belonging to jurisdiction', async function () {
      // given
      const authenticatedUserId = Symbol('userId');
      const campaignParticipationId = Symbol('campaignParticipationId');
      const request = {
        auth: { credentials: { userId: authenticatedUserId } },
        params: {
          campaignParticipationId,
        },
      };

      const checkUserCanAccessCampaignParticipationStub = sinon.stub();
      checkUserCanAccessCampaignParticipationStub
        .rejects()
        .withArgs({ userId: authenticatedUserId, campaignParticipationId })
        .resolves(true);

      // when
      const prehandlerResult = await campaignParticipationPreHandlers.checkUserCanAccessCampaignParticipation(
        request,
        hFake,
        {
          checkUserCanAccessCampaignParticipation: checkUserCanAccessCampaignParticipationStub,
        },
      );

      // then
      expect(prehandlerResult).to.equal(hFake.continue);
    });

    it('return forbidden when userId cannot access campaignParticipation', async function () {
      // given
      const authenticatedUserId = Symbol('userId');
      const campaignParticipationId = Symbol('campaignParticipationId');
      const request = {
        auth: { credentials: { userId: authenticatedUserId } },
        params: {
          campaignParticipationId,
        },
      };

      const checkUserCanAccessCampaignParticipationStub = sinon.stub();
      checkUserCanAccessCampaignParticipationStub
        .rejects()
        .withArgs({ userId: authenticatedUserId, campaignParticipationId })
        .resolves(false);

      // when
      const prehandlerResult = await campaignParticipationPreHandlers.checkUserCanAccessCampaignParticipation(
        request,
        hFake,
        {
          checkUserCanAccessCampaignParticipation: checkUserCanAccessCampaignParticipationStub,
        },
      );

      // then
      expect(prehandlerResult).to.deep.equal(boom.forbidden());
    });

    it('return forbidden when userId is not authenticated', async function () {
      // given
      const campaignParticipationId = Symbol('campaignParticipationId');
      const request = {
        params: {
          campaignParticipationId,
        },
      };

      const checkUserCanAccessCampaignParticipationStub = sinon.stub();

      // when
      const prehandlerResult = await campaignParticipationPreHandlers.checkUserCanAccessCampaignParticipation(
        request,
        hFake,
        {
          checkUserCanAccessCampaignParticipation: checkUserCanAccessCampaignParticipationStub,
        },
      );

      // then
      expect(checkUserCanAccessCampaignParticipationStub.called).false;
      expect(prehandlerResult).to.deep.equal(boom.forbidden());
    });

    it('return forbidden when campaignParticipationId is not existing', async function () {
      // given
      const authenticatedUserId = Symbol('userId');
      const request = {
        auth: { credentials: { userId: authenticatedUserId } },
        params: {
          campaignParticipationId: null,
        },
      };

      const checkUserCanAccessCampaignParticipationStub = sinon.stub();

      // when
      const prehandlerResult = await campaignParticipationPreHandlers.checkUserCanAccessCampaignParticipation(
        request,
        hFake,
        {
          checkUserCanAccessCampaignParticipation: checkUserCanAccessCampaignParticipationStub,
        },
      );

      // then
      expect(checkUserCanAccessCampaignParticipationStub.called).false;
      expect(prehandlerResult).to.deep.equal(boom.forbidden());
    });
  });
});
