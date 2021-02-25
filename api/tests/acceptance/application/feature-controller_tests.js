const { expect } = require('../../test-helper');

const createServer = require('../../../server');

describe('Acceptance | Controller | feature-toggle-controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/feature-toggles', () => {

    const options = {
      method: 'GET',
      url: '/api/feature-toggles',
    };

    it('should return 200 with feature toggles', async () => {
      // given
      const expectedData = {
        data: {
          id: '0',
          attributes: {
            'reports-categorization': false,
            'is-pole-emploi-enabled': false,
            'my-account': false,
            'is-certification-results-in-orga-enabled': false,
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
