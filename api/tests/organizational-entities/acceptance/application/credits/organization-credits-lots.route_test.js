import { expect } from 'chai';

import { createServer } from '../../../../../server.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Organizational Entities | Application | Route | Credits | Organization credits lots', function () {
  describe('GET /api/organizations/{id}/credits-lots', function () {
    it('returns the organization credits lots with their consumptions and 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const { organization, structure } = databaseBuilder.factory.buildOrganizationWithStructure();
      const creditsManagementFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.CREDITS_MANAGEMENT);
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: organization.id,
        featureId: creditsManagementFeature.id,
      });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });

      const creditsLotId = databaseBuilder.factory.buildCreditsLot({ structureId: structure.id, count: 3 }).id;
      const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
      }).id;
      databaseBuilder.factory.buildCreditsConsumption({ creditsLotId, organizationLearnerId });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/organizations/${organization.id}/credits-lots`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.have.lengthOf(1);
      expect(response.result.data[0].type).to.equal('organization-credits-lots');
      expect(response.result.data[0].attributes['consumed-count']).to.equal(1);
      expect(response.result.data[0].attributes['available-count']).to.equal(2);
    });
  });
});
