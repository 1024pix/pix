const { expect, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | cache-controller', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  describe('PATCH /api/cache/{model}/{id}', function() {

    let options;

    beforeEach(function() {
      options = {
        method: 'PATCH',
        url: '/api/cache/challenges/recChallengeId',
        headers: {},
        payload: {
          id: 'recChallengeId',
          param: 'updatedModelParam',
        },
      };
    });

    describe('Resource access management', function() {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function() {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async function() {
        // given
        const nonPixMasterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMasterUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('PATCH /api/cache', function() {

    let options;

    beforeEach(function() {
      options = {
        method: 'PATCH',
        url: '/api/cache',
        headers: {},
      };
    });

    describe('Resource access management', function() {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function() {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async function() {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
