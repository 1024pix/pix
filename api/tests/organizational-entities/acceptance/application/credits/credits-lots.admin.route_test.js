import { expect } from 'chai';

import { createServer } from '../../../../../server.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Organizational Entities | Application | Route | Admin | Credits | Credits-lots', function () {
  describe('POST /api/admin/organizations/{organizationId}/credits-lots', function () {
    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();
      const creditsManagementFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT);
      const structureId = databaseBuilder.factory.buildStructure().id;
      const organizationId = databaseBuilder.factory.buildOrganization({
        structureId,
      }).id;
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: creditsManagementFeature.id,
      });
      const superAdminId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/organizations/${organizationId}/credits-lots`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdminId,
        }),
        payload: {
          data: {
            type: 'credits-lots',
            attributes: {
              count: 77,
              reference: 'BradIsTheBest',
              'activation-date': '2026-01-01',
              'expiration-date': '2027-01-01',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);

      const createdCreditsLot = await knex('credits_lots')
        .select('structure_id')
        .where({ reference: 'BradIsTheBest' })
        .first();

      expect(createdCreditsLot.structure_id).to.equal(structureId);
    });
  });

  describe('GET /api/admin/organizations/{organizationId}/credits-lots', function () {
    it('returns a list of credits lots with 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const structureId = databaseBuilder.factory.buildStructure().id;

      const organizationId = databaseBuilder.factory.buildOrganization({
        structureId,
      }).id;

      const creditsManagementFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT);

      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: creditsManagementFeature.id,
      });

      const superAdminId = databaseBuilder.factory.buildUser.withRoleSuperAdmin().id;

      databaseBuilder.factory.buildCreditsLot({
        structureId,
        createdBy: superAdminId,
      });

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/organizations/${organizationId}/credits-lots`,
        headers: generateAuthenticatedUserRequestHeaders({
          userId: superAdminId,
        }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
