import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | finalized-session-controller-find-finalized-sessions-to-publish', function () {
  let server, options;

  beforeEach(async function () {
    server = await createServer();
    await insertUserWithRoleSuperAdmin();
  });

  describe('GET /api/admin/sessions/to-publish', function () {
    beforeEach(function () {
      options = {
        method: 'GET',
        url: '/api/admin/sessions/to-publish',
        payload: {},
      };

      databaseBuilder.factory.buildSession({ id: 121 });
      databaseBuilder.factory.buildSession({ id: 333 });
      databaseBuilder.factory.buildSession({ id: 323 });
      databaseBuilder.factory.buildSession({ id: 423 });

      databaseBuilder.factory.buildFinalizedSession({ sessionId: 121, isPublishable: true, publishedAt: null });
      databaseBuilder.factory.buildFinalizedSession({ sessionId: 333, isPublishable: true, publishedAt: null });
      databaseBuilder.factory.buildFinalizedSession({ sessionId: 323, isPublishable: false, publishedAt: null });
      databaseBuilder.factory.buildFinalizedSession({ sessionId: 423, isPublishable: true, publishedAt: '2021-01-02' });

      return databaseBuilder.commit();
    });
    context('When user is authorized', function () {
      beforeEach(function () {
        options.headers = { authorization: generateValidRequestAuthorizationHeader() };
      });

      it('should return a 200 status code response with JSON API serialized', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('to-be-published-sessions');
      });
    });
  });
});
