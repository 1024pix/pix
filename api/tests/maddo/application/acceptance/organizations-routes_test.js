import { expect } from 'chai';

import { Campaign } from '../../../../src/maddo/domain/models/Campaign.js';
import { Organization } from '../../../../src/maddo/domain/models/Organization.js';
import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import { getMaddoServer } from '../../../tooling/server/shared-server.js';
import { generateValidRequestAuthorizationHeaderForApplication } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Maddo | Route | Organizations', function () {
  let server;

  beforeEach(async function () {
    server = await getMaddoServer();
  });

  describe('GET /api/organizations', function () {
    it('returns the list of all organizations of the client jurisdiction with an HTTP status code 200', async function () {
      // given
      const orgaInJurisdiction = databaseBuilder.factory.buildOrganization({
        name: 'orga-in-jurisdiction',
        externalId: 'external-id1',
      });
      const orgaAlsoInJurisdiction = databaseBuilder.factory.buildOrganization({
        name: 'orga-also-in-jurisdiction',
        externalId: 'external-id2',
      });
      databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

      const tag = databaseBuilder.factory.buildTag();
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaAlsoInJurisdiction.id, tagId: tag.id });

      const clientId = 'client';
      databaseBuilder.factory.buildClientApplication({
        clientId: 'client',
        jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: '/api/organizations',
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'meta'),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal([
        new Organization({ id: orgaInJurisdiction.id, name: orgaInJurisdiction.name, externalId: 'external-id1' }),
        new Organization({
          id: orgaAlsoInJurisdiction.id,
          name: orgaAlsoInJurisdiction.name,
          externalId: 'external-id2',
        }),
      ]);
    });
  });

  describe('GET /api/organizations/{organizationId}/campaigns', function () {
    let orgaInJurisdiction, orgaAlsoInJurisdiction, orgaNotInJurisdiction;
    let clientId;

    beforeEach(async function () {
      orgaInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-in-jurisdiction' });
      orgaAlsoInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-also-in-jurisdiction' });
      orgaNotInJurisdiction = databaseBuilder.factory.buildOrganization({ name: 'orga-not-in-jurisdiction' });

      const tag = databaseBuilder.factory.buildTag();
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaInJurisdiction.id, tagId: tag.id });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: orgaAlsoInJurisdiction.id, tagId: tag.id });

      clientId = 'client';
      databaseBuilder.factory.buildClientApplication({
        clientId: 'client',
        jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
      });
      await databaseBuilder.commit();
    });

    it('returns all campaigns (not archived, not deleted) of organization in client jurisdiction with status 200', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign1 = databaseBuilder.factory.buildCampaign({
        organizationId: orgaInJurisdiction.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: orgaInJurisdiction.id,
        targetProfileId: targetProfile.id,
        archivedAt: new Date('2026-01-01'),
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: orgaInJurisdiction.id,
        targetProfileId: targetProfile.id,
        deletedAt: new Date('2026-01-01'),
      });
      const campaign2 = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.PROFILES_COLLECTION,
        organizationId: orgaInJurisdiction.id,
      });
      databaseBuilder.factory.buildCampaign({
        organizationId: orgaAlsoInJurisdiction.id,
      });
      databaseBuilder.factory.buildCampaign({ organizationId: orgaNotInJurisdiction.id });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/organizations/${orgaInJurisdiction.id}/campaigns`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.page).to.deep.equal({
        number: 1,
        size: 1000,
        count: 1,
      });
      expect(response.result.campaigns).to.deep.equal([
        new Campaign({
          id: campaign1.id,
          name: campaign1.name,
          type: campaign1.type,
          targetProfileName: targetProfile.name,
          code: campaign1.code,
          createdAt: campaign1.createdAt,
          archivedAt: null,
        }),
        new Campaign({
          id: campaign2.id,
          name: campaign2.name,
          type: campaign2.type,
          targetProfileName: null,
          code: campaign2.code,
          createdAt: campaign2.createdAt,
          archivedAt: null,
          tubes: null,
        }),
      ]);
    });

    context('with param withArchived true', function () {
      it('returns all campaigns (archived or not, but not deleted) of organization in client jurisdiction with status 200', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const campaign1 = databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
          targetProfileId: targetProfile.id,
        });
        const campaign2 = databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
          targetProfileId: targetProfile.id,
          archivedAt: new Date('2026-01-01'),
        });
        databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
          targetProfileId: targetProfile.id,
          deletedAt: new Date('2026-01-01'),
        });
        const campaign3 = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.PROFILES_COLLECTION,
          organizationId: orgaInJurisdiction.id,
        });
        databaseBuilder.factory.buildCampaign({
          organizationId: orgaAlsoInJurisdiction.id,
        });
        databaseBuilder.factory.buildCampaign({ organizationId: orgaNotInJurisdiction.id });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${orgaInJurisdiction.id}/campaigns?withArchived=true`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.page).to.deep.equal({
          number: 1,
          size: 1000,
          count: 1,
        });
        expect(response.result.campaigns).to.deep.equal([
          new Campaign({
            id: campaign1.id,
            name: campaign1.name,
            type: campaign1.type,
            targetProfileName: targetProfile.name,
            code: campaign1.code,
            createdAt: campaign1.createdAt,
            archivedAt: null,
          }),
          new Campaign({
            id: campaign2.id,
            name: campaign2.name,
            type: campaign2.type,
            targetProfileName: targetProfile.name,
            code: campaign2.code,
            createdAt: campaign2.createdAt,
            archivedAt: campaign2.archivedAt,
          }),
          new Campaign({
            id: campaign3.id,
            name: campaign3.name,
            type: campaign3.type,
            targetProfileName: null,
            code: campaign3.code,
            createdAt: campaign3.createdAt,
            archivedAt: null,
            tubes: null,
          }),
        ]);
      });
    });

    context('pagination management', function () {
      it('returns the n first campaigns of organization in client jurisdiction with status 200', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const campaign1InJurisdiction = databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
          targetProfileId: targetProfile.id,
        });

        databaseBuilder.factory.buildCampaign({
          organizationId: orgaInJurisdiction.id,
        });

        await databaseBuilder.commit();

        const options = {
          method: 'GET',
          url: `/api/organizations/${orgaInJurisdiction.id}/campaigns?page[number]=1&page[size]=1`,
          headers: {
            authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'campaigns'),
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.campaigns).to.deep.equal([
          new Campaign({
            id: campaign1InJurisdiction.id,
            name: campaign1InJurisdiction.name,
            type: campaign1InJurisdiction.type,
            targetProfileName: targetProfile.name,
            code: campaign1InJurisdiction.code,
            createdAt: campaign1InJurisdiction.createdAt,
            archivedAt: campaign1InJurisdiction.archivedAt,
          }),
        ]);
      });
    });

    it('responds with an HTTP Forbidden when organization is not in jurisdiction', async function () {
      // given
      const options = {
        method: 'GET',
        url: `/api/organizations/${orgaNotInJurisdiction.id}/campaigns`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(clientId, 'pix-client', 'meta'),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
