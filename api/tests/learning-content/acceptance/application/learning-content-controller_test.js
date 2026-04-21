import { server } from '../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | lcms-controller', function () {
  describe('PATCH /api/cache/{model}/{id}', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given & when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache/challenges/recChallengeId',
          headers: { authorization: 'invalid.access.token' },
          payload: {
            id: 'recChallengeId',
            param: 'updatedModelParam',
          },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not a Super Admin', async function () {
        // given
        const nonSuperAdminUserId = 9999;

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache/challenges/recChallengeId',
          headers: generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId }),
          payload: {
            id: 'recChallengeId',
            param: 'updatedModelParam',
          },
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('PATCH /api/cache', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given & when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache',
          headers: { authorization: 'invalid.access.token' },
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user is not a Super Admin', async function () {
        // given
        const nonSuperAdminUserId = 9999;

        // when
        const response = await server.inject({
          method: 'PATCH',
          url: '/api/cache',
          headers: generateAuthenticatedUserRequestHeaders({ userId: nonSuperAdminUserId }),
        });

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
