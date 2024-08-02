import { createServer, expect } from '../../../test-helper.js';

describe('Acceptance | Controller | swagger', function () {
  // Increase the test timeout because swagger.json endpoints can be long to generate/respond.
  this.timeout(5000);

  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/swagger.json', function () {
    describe('Resource access management', function () {
      it('should respond with a 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/api/swagger.json',
          headers: {},
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /livret-scolaire/swagger.json', function () {
    describe('Resource access management', function () {
      it('should respond with a 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/livret-scolaire/swagger.json',
          headers: {},
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /pole-emploi/swagger.json', function () {
    describe('Resource access management', function () {
      it('should respond with a 200', async function () {
        // given
        const options = {
          method: 'GET',
          url: '/pole-emploi/swagger.json',
          headers: {},
        };
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
