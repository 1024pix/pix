import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | change-lang', function () {
  let server;
  let user;
  let options;
  const newLang = 'en';

  beforeEach(async function () {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ lang: 'fr' });

    options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/lang/${newLang}`,
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

    it('should respond with a 400 where the langage is not correct', async function () {
      // given
      options.url = `/api/users/${user.id}/lang/jp`;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('Success case', function () {
    it('should return the user with new lang', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes['lang']).to.equal(newLang);
    });
  });
});
