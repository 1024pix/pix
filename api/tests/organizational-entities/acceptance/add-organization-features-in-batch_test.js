import iconv from 'iconv-lite';

import { PIX_ADMIN } from '../../../src/authorization/domain/constants.js';
import { createServer, databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../test-helper.js';

describe('Acceptance | Application | Organizations | POST /api/admin/organizations/add-organization-features', function () {
  context('When a CSV  file is loaded', function () {
    let server, feature, firstOrganization, otherOrganization;
    beforeEach(async function () {
      feature = databaseBuilder.factory.buildFeature({ key: 'feature', description: ' best feature ever' });
      firstOrganization = databaseBuilder.factory.buildOrganization({ name: 'first organization', type: 'PRO' });
      otherOrganization = databaseBuilder.factory.buildOrganization({ name: 'other organization', type: 'PRO' });

      await databaseBuilder.commit();

      server = await createServer();
    });

    it('should respond with a 204 - no content', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole({ role: PIX_ADMIN.ROLES.SUPER_ADMIN }).id;
      await databaseBuilder.commit();

      const input = `Feature ID;Organization ID;Params
      ${feature.id};${firstOrganization.id};{"id": 123}
      ${feature.id};${otherOrganization.id};{"id": 123}`;

      const options = {
        method: 'POST',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        url: '/api/admin/organizations/add-organization-features',
        payload: iconv.encode(input, 'UTF-8'),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
