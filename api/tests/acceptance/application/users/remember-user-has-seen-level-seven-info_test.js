import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
describe('Acceptance | Route | user-has-seen-level-seven-info ', function () {
  let server;
  let user;
  let options;

  async function givenUserHasSeenLevelSevenInfo(hasSeenLevelSevenInfo) {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ hasSeenLevelSevenInfo });

    options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/user-has-seen-level-seven-info`,
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    await databaseBuilder.commit();
  }

  describe('Resource access management', function () {
    beforeEach(async function () {
      await givenUserHasSeenLevelSevenInfo(false);
    });
    it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
      options.headers.authorization = 'invalid.access.token';

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(401);
    });

    it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
      const otherUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(403);
    });
  });

  describe('User has seen level seven info', function () {
    it('should return the user with hasSeenLevelSevenInfo to true', async function () {
      await givenUserHasSeenLevelSevenInfo(true);

      const response = await server.inject(options);

      expect(response.result.data.attributes['has-seen-level-seven-info']).to.be.true;
    });
  });

  describe('User has not seen level seven info', function () {
    it('should return the user with hasSeenLevelSevenInfo to true', async function () {
      await givenUserHasSeenLevelSevenInfo(false);

      const response = await server.inject(options);

      expect(response.result.data.attributes['has-seen-level-seven-info']).to.be.true;
    });
  });
});
