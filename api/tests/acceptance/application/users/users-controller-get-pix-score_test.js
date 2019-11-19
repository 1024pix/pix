const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | users-controller-get-pix-score', () => {

  let server;
  let options;
  let user;

  beforeEach(async () => {
    // create server
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    databaseBuilder.factory.buildKnowledgeElement({ userId: user.id, earnedPix: 3 });
    databaseBuilder.factory.buildKnowledgeElement({ userId: user.id, earnedPix: 4 });

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/pixscore`,
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  describe('GET /users/:id/pixscore', () => {

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

      it('should return a 200 status code response with JSON API serialized PixScore', () => {
        // given
        const pixScoreExpected = {
          data: {
            attributes: {
              value: 7
            },
            id: `${user.id}`,
            type: 'pix-scores'
          }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal(pixScoreExpected);
        });
      });
    });
  });
});
