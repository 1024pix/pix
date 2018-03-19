const { expect } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | error-controller', () => {

  describe('GET /errors/500', () => {

    const options = {
      method: 'GET',
      url: '/errors/500',
    };

    it('should return 500 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(500);
      });
    });
  });
});
