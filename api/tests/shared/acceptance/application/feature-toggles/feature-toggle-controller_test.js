import { createServer, expect } from '../../../../test-helper.js';

describe('Acceptance | Shared | Application | Controller | feature-toggle', function () {
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
            'deprecate-pole-emploi-push-notification': false,
            'is-always-ok-validate-next-challenge-endpoint-enabled': false,
            'is-async-quest-rewarding-calculation-enabled': false,
            'is-need-to-adjust-certification-accessibility-enabled': false,
            'is-pix1d-enabled': true,
            'is-pix-companion-enabled': false,
            'is-quest-enabled': false,
            'is-self-account-deletion-enabled': false,
            'is-text-to-speech-button-enabled': false,
            'is-legal-documents-versioning-enabled': false,
            'setup-ecosystem-before-start': false,
            'show-experimental-missions': false,
            'show-new-campaign-presentation-page': false,
            'show-new-result-page': false,
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
