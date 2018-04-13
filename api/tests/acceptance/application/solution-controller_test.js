const { expect } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | solution-controller', () => {

  describe('GET /api/solutions', function() {

    it('should not necessitate auth and return 200 HTTP status', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/solutions?assessmentId=23&answerId=234'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
