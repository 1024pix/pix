import boom from '@hapi/boom';
import sinon from 'sinon';

import {
  isCampaignInJurisdictionPreHandler,
  isOrganizationInJurisdictionPreHandler,
  organizationPreHandler,
} from '../../../../src/maddo/application/pre-handlers.js';
import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Unit | Maddo | Application | pre handlers', function () {
  describe('#organizationPreHandler', function () {
    it('returns allowed organizations ids for authentified client application', async function () {
      // given
      const request = {
        auth: {
          credentials: {
            client_id: 'client_id',
          },
        },
      };

      const findOrganizationIdsByClientApplication = sinon.stub();
      findOrganizationIdsByClientApplication.withArgs({ clientId: 'client_id' }).resolves(['orga1', 'orga2']);

      // when
      const organizationIds = await organizationPreHandler.method(request, hFake, {
        findOrganizationIdsByClientApplication,
      });

      // then
      expect(organizationIds).to.deep.equal(['orga1', 'orga2']);
    });
  });

  describe('#isOrganizationInJurisdictionPreHandler', function () {
    it('calls continue when organization belongs to jurisdiction', function () {
      // given
      const request = {
        pre: {
          organizationIds: ['orgaInJuridictionId'],
        },
        params: {
          organizationId: 'orgaInJuridictionId',
        },
      };

      // when
      const prehandlerResult = isOrganizationInJurisdictionPreHandler.method(request, hFake);

      // then
      expect(prehandlerResult).to.equal(hFake.continue);
    });

    it('returns forbidden when organization does not belong to jurisdiction', function () {
      // given
      const request = {
        pre: {
          organizationIds: ['orgaInJuridictionId'],
        },
        params: {
          organizationId: 'orgaNotInJuridictionId',
        },
      };

      // when
      const prehandlerResult = isOrganizationInJurisdictionPreHandler.method(request, hFake);

      // then
      expect(prehandlerResult).to.deep.equal(boom.forbidden());
    });

    it('returns forbidden when jurisdiction has not been resolved before', function () {
      // given
      const request = {
        params: {
          organizationId: 'orgaNotInJuridictionId',
        },
      };

      // when
      const prehandlerResult = isOrganizationInJurisdictionPreHandler.method(request, hFake);

      // then
      expect(prehandlerResult).to.deep.equal(boom.forbidden());
    });
  });

  describe('#isCampaignInJurisdictionPreHandler', function () {
    it('calls continue when campaign is linked to an organization belonging to jurisdiction', async function () {
      // given
      const request = {
        pre: {
          organizationIds: ['orgaInJuridictionId'],
        },
        params: {
          campaignId: 'campaignInJurisdictionId',
        },
      };

      const getCampaignOrganizationId = sinon.stub();
      getCampaignOrganizationId
        .rejects()
        .withArgs({ campaignId: 'campaignInJurisdictionId' })
        .resolves('orgaInJuridictionId');

      // when
      const prehandlerResult = await isCampaignInJurisdictionPreHandler.method(request, hFake, {
        getCampaignOrganizationId,
      });

      // then
      expect(prehandlerResult).to.equal(hFake.continue);
    });

    it('returns forbidden when campaign is linked to an organization not belonging to jurisdiction', async function () {
      // given
      const request = {
        pre: {
          organizationIds: ['orgaInJuridictionId'],
        },
        params: {
          campaignId: 'campaignNotInJurisdictionId',
        },
      };

      const getCampaignOrganizationId = sinon.stub();
      getCampaignOrganizationId
        .rejects()
        .withArgs({ campaignId: 'campaignNotInJurisdictionId' })
        .resolves('orgaNotInJuridictionId');

      // when
      const prehandlerResult = await isCampaignInJurisdictionPreHandler.method(request, hFake, {
        getCampaignOrganizationId,
      });

      // then
      expect(prehandlerResult).to.deep.equal(boom.forbidden());
    });

    it('returns forbidden when jurisdiction has not been resolved before', async function () {
      // given
      const request = {
        params: {
          campaignId: 'campaignNotInJurisdictionId',
        },
      };

      const getCampaignOrganizationId = sinon.stub();
      getCampaignOrganizationId
        .rejects()
        .withArgs({ campaignId: 'campaignNotInJurisdictionId' })
        .resolves('orgaNotInJuridictionId');

      // when
      const prehandlerResult = await isCampaignInJurisdictionPreHandler.method(request, hFake, {
        getCampaignOrganizationId,
      });

      // then
      expect(prehandlerResult).to.deep.equal(boom.forbidden());
    });
  });
});
