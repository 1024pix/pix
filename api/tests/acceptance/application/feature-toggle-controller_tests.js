const { expect } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Controller | feature-toggle-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/feature-toggles', function () {
    const options = {
      method: 'GET',
      url: '/api/feature-toggles',
    };

    it('should return 200 with feature toggles', async function () {
      // given
      const expectedData = {
        data: {
          id: '0',
          attributes: {
            'is-certification-billing-enabled': false,
            'is-new-tutorials-page-enabled': false,
          },
          type: 'feature-toggles',
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal(expectedData);
    });
  });
});
