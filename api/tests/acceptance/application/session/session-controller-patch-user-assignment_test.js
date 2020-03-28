const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('PATCH /api/sessions/:id/user-assignment', () => {
  let server;
  const options = { method: 'PATCH' };
  let userId;

  beforeEach(async () => {
    server = await createServer();
  });

  context('when user does not have the role PIX MASTER', () => {

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a 403 error code', async () => {
      // given
      options.url = '/api/sessions/any/user-assignment';
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('when user has role PixMaster', () => {

    beforeEach(() => {
      // given
      userId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
      return databaseBuilder.commit();
    });

    context('when the session id has an invalid format', () => {

      it('should return a 404 error code', async () => {
        // given
        options.url = '/api/sessions/any/user-assignment';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when the session id is a number', () => {

      context('when the session does not exist', () => {

        it('should return a 404 error code', async () => {
          // given
          options.url = '/api/sessions/1/user-assignment';

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
          options.url = `/api/sessions/${sessionId}/user-assignment`;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should return the serialized session with a link to the assigned user', async () => {
          // given
          options.url = `/api/sessions/${sessionId}/user-assignment`;

          // when
          const response = await server.inject(options);

          // then
          const linkToAssignedUser = response.result.data.relationships['assigned-user'].links.related;
          expect(linkToAssignedUser).to.equal(`/api/users/${userId}`);
        });
      });
    });
  });
});
