const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../../server');

describe('Acceptance | Controller | change-lang', () => {

  let server;
  let user;
  let options;
  const newLang = 'en';

  beforeEach(async () => {
    server = await createServer();

    user = databaseBuilder.factory.buildUser({ lang: 'fr' });

    options = {
      method: 'PATCH',
      url: `/api/users/${user.id}/lang/${newLang}`,
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
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

    it('should respond with a 400 where the langage is not correct', async () => {
      // given
      options.url = `/api/users/${user.id}/lang/jp`;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('Success case', () => {

    it('should return the user with new lang', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes['lang']).to.equal(newLang);

    });
  });
});
