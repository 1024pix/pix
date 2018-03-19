const { expect, generateValidRequestAuhorizationHeader } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | cache-controller', () => {

  describe('DELETE /api/cache', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'DELETE',
        url: '/api/cache',
        headers: { }
      };
    });

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuhorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
