const { expect, generateValidRequestAuthorizationHeader, HttpTestServer } = require('../../test-helper');

const moduleUnderTest = require('../../../lib/application/cache');

describe('Acceptance | Controller | cache-controller', () => {

  let server;

  before(async () => {
    server = new HttpTestServer(moduleUnderTest, true);
  });

  describe('PATCH /api/cache/{model}/{id}', () => {

    let request;

    beforeEach(() => {
      request = {
        method: 'PATCH',
        url: '/api/cache/challenges/recChallengeId',
        headers: {},
        payload: {
          id: 'recChallengeId',
          param: 'updatedModelParam',
        },
      };
    });

    describe('Resource access management', () => {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        request.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async () => {
        // given
        const nonPixMasterUserId = 9999;
        request.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMasterUserId);

        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('PATCH /api/cache', () => {

    let request;

    beforeEach(() => {
      request = {
        method: 'PATCH',
        url: '/api/cache',
        headers: {},
      };
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        request.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async () => {
        // given
        const nonPixMAsterUserId = 9999;
        request.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
