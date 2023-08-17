import { createServer } from '../../../../server.js';
import { databaseBuilder, expect, generateValidRequestAuthorizationHeader } from '../../../test-helper.js';

describe('Acceptance | Controller | users-controller-remember-user-has-seen-assessment-instructions', function () {
  let server;
  let user;
  let options;

  beforeEach(async function () {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ hasSeenAssessmentInstructions: false });

    options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/remember-user-has-seen-assessment-instructions`,
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  describe('Resource access management', function () {
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

  describe('Success case', function () {
    it('should return the user with hasSeenAssessmentInstructions', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.attributes['has-seen-assessment-instructions']).to.be.true;
    });
  });
});
