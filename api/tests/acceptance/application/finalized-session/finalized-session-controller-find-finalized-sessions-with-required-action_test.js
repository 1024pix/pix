import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper';

import createServer from '../../../../server';

describe('Acceptance | Controller | finalized-session-controller-find-finalized-sessions-with-required-action', function () {
  describe('GET /api/admin/sessions/with-required-action', function () {
    context('When user is authorized', function () {
      it('should return a 200 status code response with JSON API serialized', async function () {
        await insertUserWithRoleSuperAdmin();

        databaseBuilder.factory.buildSession({ id: 121 });
        databaseBuilder.factory.buildSession({ id: 333 });
        databaseBuilder.factory.buildSession({ id: 323 });
        databaseBuilder.factory.buildSession({ id: 423 });

        databaseBuilder.factory.buildFinalizedSession({ sessionId: 121, isPublishable: false, publishedAt: null });
        databaseBuilder.factory.buildFinalizedSession({ sessionId: 333, isPublishable: false, publishedAt: null });
        databaseBuilder.factory.buildFinalizedSession({ sessionId: 323, isPublishable: true, publishedAt: null });
        databaseBuilder.factory.buildFinalizedSession({
          sessionId: 423,
          isPublishable: false,
          publishedAt: '2021-01-02',
        });

        await databaseBuilder.commit();

        const server = await createServer();
        const options = {
          method: 'GET',
          url: '/api/admin/sessions/with-required-action',
          payload: {},
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data).to.have.lengthOf(2);
        expect(response.result.data[0].type).to.equal('with-required-action-sessions');
      });
    });
  });
});
