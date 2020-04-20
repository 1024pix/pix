const {
  expect, generateValidRequestAuthorizationHeader, databaseBuilder,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('GET /api/admin/certification-officer/:id', () => {
  let server;
  const options = { method: 'GET' };
  let user;
  let pixMasterId;

  beforeEach(async () => {
    server = await createServer();
  });

  context('when user does not have the role PIX MASTER', () => {
    let nonPixMasterId;

    beforeEach(() => {
      nonPixMasterId = databaseBuilder.factory.buildUser().id;
      return databaseBuilder.commit();
    });

    it('should return a 403 error code', async () => {
      // given
      options.url = '/api/admin/certification-officer/id';
      options.headers = { authorization: generateValidRequestAuthorizationHeader(nonPixMasterId) };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });

  context('when user has role PixMaster', () => {

    beforeEach(() => {
      // given
      pixMasterId = databaseBuilder.factory.buildUser.withPixRolePixMaster().id;
      options.headers = { authorization: generateValidRequestAuthorizationHeader(pixMasterId) };
      return databaseBuilder.commit();
    });

    context('when the requested user id has an invalid format', () => {

      it('should return a 404 error code', async () => {
        // given
        options.url = '/api/admin/certification-officer/any';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when the requested user id is a number', () => {

      context('when the requested user does not exist', () => {

        it('should return a 404 error code', async () => {
          // given
          options.url = '/api/admin/certification-officer/1123456';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when the user exists', () => {
        beforeEach(() => {
          // given
          user = databaseBuilder.factory.buildUser();
          return databaseBuilder.commit();
        });

        it('should return a 200 status code', async () => {
          // given
          options.url = `/api/admin/certification-officer/${user.id}`;

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should return the serialized user', async () => {
          // given
          options.url = `/api/admin/certification-officer/${user.id}`;

          // when
          const response = await server.inject(options);

          // then
          expect(response.result.data.attributes['first-name']).to.equal(user.firstName);
          expect(response.result.data.attributes['last-name']).to.equal(user.lastName);
          expect(response.result.data.attributes['email']).to.equal(user.email);
        });
      });
    });
  });
});
