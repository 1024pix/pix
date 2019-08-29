const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-remember-user-has-seen-new-profile-info', () => {

  let server;
  let user;
  let options;

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ hasSeenNewProfileInfo: false });

    options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/remember-user-has-seen-new-profile-info`,
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  describe('Resource access management', () => {

    it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
      // given
      options.headers.authorization = 'invalid.access.token';

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async () => {
      // given
      const otherUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('Success case', () => {

    it('should return the user with hasSeenNewProfileInfo', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.attributes['has-seen-new-profile-info']).to.be.true;
    });
  });
});
