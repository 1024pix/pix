const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-has-seen-challenge-tooltip', function () {
  let server;
  let user;
  let options;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('Resource access management', function () {
    beforeEach(function () {
      user = databaseBuilder.factory.buildUser();

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/has-seen-challenge-tooltip/other`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      return databaseBuilder.commit();
    });

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
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('Success cases', function () {
    it('should return the user with has seen other challenges tooltip', async function () {
      // given
      user = databaseBuilder.factory.buildUser();

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/has-seen-challenge-tooltip/other`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      await databaseBuilder.commit();
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.attributes['has-seen-other-challenges-tooltip']).to.be.true;
    });
  });
});
