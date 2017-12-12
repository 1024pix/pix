const { describe, it, after, expect } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | session-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('GET /sessions', function() {

    const options = {
      method: 'GET', url: '/api/sessions', payload: {}
    };

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.injectThen(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
        });
    });

    it('should return a session code', () => {
      // when
      const promise = server.injectThen(options);

      // then
      return promise
        .then((response) => {
          const code = response.result;
          expect(code).to.have.lengthOf(6);
        });
    });
  });
});
