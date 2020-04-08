const { expect, generateValidRequestAuthorizationHeader } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | cache-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('DELETE /api/cache/{cachekey}', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'DELETE',
        url: '/api/cache',
        headers: {}
      };
    });

    describe('Airtable Formula injection protection', () => {
      it('should respond with a 400 - bad request - if cacheKey is not in the form of "ABCD_recXXXX"', async () => {
        // given
        const pixMasterUserId = 1234;
        options.headers.authorization = generateValidRequestAuthorizationHeader(pixMasterUserId);
        options.url = '/api/cache/SomeBadFormattedKey';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('Resource access management', () => {
      beforeEach(() => {
        options.url = '/api/cache/Epreuves_recABCD';
      });

      it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async () => {
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

  describe('PATCH /api/cache', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'PATCH',
        url: '/api/cache',
        headers: {}
      };
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

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async () => {
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
