import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Route | Users', function () {
  describe('GET /api/admin/users/{id}/organizations', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const userId = databaseBuilder.factory.buildUser().id;

      const organization1 = databaseBuilder.factory.buildOrganization({
        name: 'Organization 1',
      });

      databaseBuilder.factory.buildMembership({
        organizationId: organization1.id,
        userId,
        organizationRole: 'MEMBER',
      });

      const admin = databaseBuilder.factory.buildUser.withRole();

      await databaseBuilder.commit();

      const options = {
        method: 'GET',
        url: `/api/admin/users/${userId}/organizations`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(admin.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
