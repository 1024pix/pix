import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../../test-helper.js';

describe('Certification | Session-management | Acceptance | Application | finalized-session-controller', function () {
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
      databaseBuilder.factory.buildSession({ id: 333, version: 3 });
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

      context('When requesting only version 3', function () {
        it('should return a 200 status code response with JSON API serialized', async function () {
          options.url = '/api/admin/sessions/to-publish?filter[version]=3';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.have.lengthOf(1);
          expect(response.result.data[0].type).to.equal('to-be-published-sessions');
        });
      });
    });
  });

  describe('GET /api/admin/sessions/with-required-action', function () {
    context('When user is authorized', function () {
      it('should return a 200 status code response with JSON API serialized', async function () {
        databaseBuilder.factory.buildSession({ id: 121 });
        databaseBuilder.factory.buildSession({ id: 333 });
        databaseBuilder.factory.buildSession({ id: 323 });
        databaseBuilder.factory.buildSession({ id: 423, version: 3 });

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

      context('When requesting only version 3', function () {
        it('should return a 200 status code response with JSON API serialized', async function () {
          databaseBuilder.factory.buildSession({ id: 121 });
          databaseBuilder.factory.buildSession({ id: 333, version: 3 });
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
            url: '/api/admin/sessions/with-required-action?filter[version]=3',
            payload: {},
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data).to.have.lengthOf(1);
          expect(response.result.data[0].type).to.equal('with-required-action-sessions');
        });
      });
    });
  });
});
