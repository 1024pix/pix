const { describe, it, after, expect } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | error-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('GET /errors/500', function() {

    const options = {
      method: 'GET', url: '/errors/500', payload: {}
    };

    it('should return 500 HTTP status code', () => {
      return server.injectThen(options)
        .then((response) => {
          expect(response.statusCode).to.equal(500);
        });
    });
  });
});
