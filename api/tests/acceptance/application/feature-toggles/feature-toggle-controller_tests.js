import { expect } from '../../../test-helper';
import createServer from '../../../../server';

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
          type: 'feature-toggles',
          attributes: {
            'is-always-ok-validate-next-challenge-endpoint-enabled': false,
            'is-clea-results-retrieval-by-habilitated-certification-centers-enabled': false,
            'is-massive-session-management-enabled': false,
          },
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
