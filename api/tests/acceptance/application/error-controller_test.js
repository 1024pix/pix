const { expect } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | error-controller', function() {

  let server;

  beforeEach(async function() {
    server = await createServer();
  });

  describe('GET /errors/500', function() {

    const options = {
      method: 'GET',
      url: '/errors/500',
    };

    it('should return 500 HTTP status code', function() {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(500);
      });
    });
  });
});
