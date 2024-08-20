import { createServer, expect } from '../../../../test-helper.js';

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
            'are-v3-info-screens-enabled': false,
            'deprecate-pole-emploi-push-notification': false,
            'is-always-ok-validate-next-challenge-endpoint-enabled': false,
            'is-pix1d-enabled': true,
            'is-pix-plus-lower-lever-enabled': false,
            'is-certification-token-scope-enabled': false,
            'is-text-to-speech-button-enabled': false,
            'is-need-to-adjust-certification-accessibility-enabled': false,
            'show-new-result-page': false,
            'show-experimental-missions': false,
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
