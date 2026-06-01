import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';

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
            'dynamic-feature-toggle-system': false,
            'disabled-locales-in-frontend': [],
            'display-catalogue': true,
            'is-async-quest-rewarding-calculation-enabled': false,
            'is-survey-enabled-for-combined-courses': true,
            'is-quest-enabled': true,
            'is-self-account-deletion-enabled': true,
            'is-text-to-speech-button-enabled': true,
            'use-pix-orga-new-auth-design': false,
            'is-pix-plus-candidate-a11y-enabled': false,
            'are-module-short-id-urls-enabled': false,
            'are-combined-courses-enabled': true,
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
