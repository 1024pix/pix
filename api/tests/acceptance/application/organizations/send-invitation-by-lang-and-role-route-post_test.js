import {
  databaseBuilder,
  expect,
  knex,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';
import Membership from '../../../../lib/domain/models/Membership';

describe('Acceptance | Route | Organizations', function () {
  describe('POST /api/admin/organizations/{id}/invitations', function () {
    afterEach(async function () {
      await knex('organization-invitations').delete();
    });

    it('should return 201 HTTP status code', async function () {
      // given
      const server = await createServer();

      const superAdmin = await insertUserWithRoleSuperAdmin();
      const organization = databaseBuilder.factory.buildOrganization();

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            lang: 'fr',
            role: Membership.roles.ADMIN,
          },
        },
      };

      const options = {
        method: 'POST',
        url: `/api/admin/organizations/${organization.id}/invitations`,
        payload,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
