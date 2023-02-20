import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | session-controller-generate-session-results-download-link', function () {
  let server;

  const sessionId = 121;
  const options = {
    method: 'GET',
    url: `/api/admin/sessions/${sessionId}/generate-results-download-link`,
    payload: {},
  };

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/admin/sessions/{id}/generate-results-download-link', function () {
    context('when user is Super Admin', function () {
      it('should return a 200 status code response', async function () {
        databaseBuilder.factory.buildSession({ id: sessionId });
        await databaseBuilder.commit();

        // when
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code', async function () {
        // when
        options.headers = { authorization: generateValidRequestAuthorizationHeader(1111) };
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // when
        options.headers = {};
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
