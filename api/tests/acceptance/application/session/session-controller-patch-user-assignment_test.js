const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('PATCH /api/jury/sessions/:id/certification-officer-assignment', () => {
  let server;
  const options = { method: 'PATCH' };
  let certificationOfficerId;

  beforeEach(async () => {
    server = await createServer();
  });

  context('when user does not have the role PIX MASTER', () => {

    beforeEach(() => {
      certificationOfficerId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a 403 error code', async () => {
      // given
      options.url = '/api/jury/sessions/12/certification-officer-assignment';
      options.headers = { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('when user has role PixMaster', () => {

    beforeEach(() => {
      // given
      certificationOfficerId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      options.headers = { authorization: generateValidRequestAuthorizationHeader(certificationOfficerId) };
      return databaseBuilder.commit();
    });

    context('when the session id has an invalid format', () => {

      it('should return a 400 error code', async () => {
        // given
        options.url = '/api/jury/sessions/test/certification-officer-assignment';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the session id is a number', () => {

      context('when the session does not exist', () => {

        it('should return a 404 error code', async () => {
          // given
          options.url = '/api/jury/sessions/1/certification-officer-assignment';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when the session exists', () => {
        let sessionId;

        beforeEach(() => {
          // given
          sessionId = databaseBuilder.factory.buildSession().id;
          return databaseBuilder.commit();
        });

        it('should return a 200 status code', async () => {
          // given
          options.url = `/api/jury/sessions/${sessionId}/certification-officer-assignment`;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });
});
