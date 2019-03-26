const { expect, generateValidRequestAuhorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | users-controller-get-pix-score', () => {

  let server;
  let options;

  beforeEach(async () => {
    // create server
    server = await createServer();

    const user = databaseBuilder.factory.buildUser();

    databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ userId: user.id, earnedPix: 3 });
    databaseBuilder.factory.buildSmartPlacementKnowledgeElement({ userId: user.id, earnedPix: 4 });

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/pixscore`,
      payload: {},
      headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  describe('GET /users/:id/pixscore', () => {

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    describe('Success case', () => {

      it('should return a 200 status code response with JSON API serialized PixScore', () => {
        // given
        const pixScoreExpected = {
          data: {
            type: 'pixscores',
            attributes: {
              'pix-score': 7
            }
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
