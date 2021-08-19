const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('PATCH /api/admin/sessions/:id/certification-officer-assignment', function() {
  let server;
  const options = { method: 'PATCH' };
  let certificationOfficerId;

  beforeEach(async function() {
    server = await createServer();
  });

  context('when user does not have the role PIX MASTER', function() {

    beforeEach(function() {
      certificationOfficerId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a 403 error code', async function() {
      // given
      options.url = '/api/admin/sessions/12/certification-officer-assignment';
      options.headers = { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('when user has role PixMaster', function() {

    beforeEach(function() {
      // given
      certificationOfficerId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      options.headers = { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) };
      return databaseBuilder.commit();
    });

    context('when the session id has an invalid format', function() {

      it('should return a 400 error code', async function() {
        // given
        options.url = '/api/admin/sessions/test/certification-officer-assignment';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the session id is a number', function() {

      context('when the session does not exist', function() {

        it('should return a 404 error code', async function() {
          // given
          options.url = '/api/admin/sessions/1/certification-officer-assignment';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when the session exists', function() {
        it('should return a 200 status code', async function() {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          databaseBuilder.factory.buildFinalizedSession({
            sessionId,
            isPublishable: true,
          });
          await databaseBuilder.commit();
          options.url = `/api/admin/sessions/${sessionId}/certification-officer-assignment`;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });
});
