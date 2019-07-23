const { expect } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | answer-controller', () => {

  describe('PATCH /api/answers/:id', () => {

    let server;
    let options;

    beforeEach(async () => {
      server = await createServer();
      options = {
        method: 'PATCH',
        url: '/api/answers/1',
        payload: {},
      };
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(204);
      });
    });
  });
});
