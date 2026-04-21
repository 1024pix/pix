import { createServer } from '../../../../../server.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Integration | Team | Application | Certification Center Membership | Admin | Route', function () {
  describe('GET /api/admin/users/{userId}/certification-center-memberships', function () {
    context('Error cases', function () {
      context('when user does not have a valid role', function () {
        it('returns a 403 HTTP status code', async function () {
          const server = await createServer();

          const user = databaseBuilder.factory.buildUser();
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
          databaseBuilder.factory.buildCertificationCenterMembership({
            certificationCenterId: certificationCenter.id,
            userId: user.id,
          });
          const userWithoutRole = databaseBuilder.factory.buildUser();

          await databaseBuilder.commit();

          const request = {
            method: 'GET',
            url: `/api/admin/users/${user.id}/certification-center-memberships`,
            headers: generateAuthenticatedUserRequestHeaders({ userId: userWithoutRole.id }),
          };

          await databaseBuilder.commit();

          // when
          const { statusCode } = await server.inject(request);

          // then
          expect(statusCode).to.equal(403);
        });
      });
    });
  });
});
