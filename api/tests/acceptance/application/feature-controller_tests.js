const { expect } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | Controller | feature-toggle-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/feature-toggles', () => {

    it('should return 200 with feature toggles', async () => {
      // when
      const options = {
        method: 'GET',
        url: '/api/feature-toggles',
      };
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          id: '0',
          attributes: {
            'certif-prescription-sco': false,
          },
          type: 'feature-toggles',
        },
      });
    });
  });
});
