const { expect } = require('../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../server');

describe('Acceptance | lib | swagger', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET swagger.json', () => {

    describe('Resource access management', () => {
      it('should respond with a 200', async () => {
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

  describe('GET /livret-scolaire/swagger.json', () => {

    describe('Resource access management', () => {
      it('should respond with a 200', async () => {
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
});
