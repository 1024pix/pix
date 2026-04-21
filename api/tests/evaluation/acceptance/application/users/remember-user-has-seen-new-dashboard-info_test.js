import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | users-controller-has-seen-new-dashboard-info', function () {
  let user;
  let options;

  beforeEach(async function () {
    user = databaseBuilder.factory.buildUser({ hasSeenNewDashboardInfo: false });

    options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/has-seen-new-dashboard-info`,
      headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
    };

    return databaseBuilder.commit();
  });

  describe('Resource access management', function () {
    it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
      // given
      options.headers.authorization = 'invalid.access.token';

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
      // given
      const otherUserId = 9999;
      options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('Success case', function () {
    it('should return the user with hasSeenNewDashboardInfo', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.attributes['has-seen-new-dashboard-info']).to.be.true;
    });
  });
});
