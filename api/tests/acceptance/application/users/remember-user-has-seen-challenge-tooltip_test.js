import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | users-controller-has-seen-challenge-tooltip', function () {
  let server;
  let user;
  let options;
  let challengeType;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('Resource access management', function () {
    beforeEach(function () {
      challengeType = 'focused';
      user = databaseBuilder.factory.buildUser({ hasSeenFocusedChallengeTooltip: false });

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/has-seen-challenge-tooltip/${challengeType}`,
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
    it('should return the user with has seen challenge tooltip', async function () {
      // given
      challengeType = 'focused';
      user = databaseBuilder.factory.buildUser({ hasSeenFocusedChallengeTooltip: false });

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/has-seen-challenge-tooltip/${challengeType}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      await databaseBuilder.commit();
      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data.attributes['has-seen-focused-challenge-tooltip']).to.be.true;
    });

    it('should return the user with has seen other challenges tooltip', async function () {
      // given
      challengeType = 'other';
      user = databaseBuilder.factory.buildUser({ hasSeenFocusedChallengeTooltip: false });

      options = {
        method: 'PATCH',
        url: `/api/users/${user.id}/has-seen-challenge-tooltip/${challengeType}`,
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
