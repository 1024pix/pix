import { expect } from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | passage-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/passages', function () {
    it('should create a new passage and response with a 201', async function () {
      // given
      const expectedResponse = {
        type: 'passages',
        attributes: {
          'module-id': 'bien-ecrire-son-adresse-mail',
        },
      };

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/passages',
        payload: {
          data: {
            type: 'passages',
            attributes: {
              'module-id': 'bien-ecrire-son-adresse-mail',
            },
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal(expectedResponse.type);
      expect(response.result.data.id).to.exist;
      expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);
    });
  });
});
