import { createServer } from '../../../../../server.js';

import { generateValidRequestAuthorizationHeaderForApplication } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Route | Get Data Organization Places', function () {
  describe('GET /api/data/organization-places', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const PIX_DATA_CLIENT_ID = 'test-pixDataCliendId';
      const PIX_DATA_SCOPE = 'statistics';

      const server = await createServer();

      // when
      const options = {
        method: 'GET',
        url: `/api/data/organization-places`,
        headers: {
          authorization: generateValidRequestAuthorizationHeaderForApplication(
            PIX_DATA_CLIENT_ID,
            'pix-data',
            PIX_DATA_SCOPE,
          ),
        },
      };

      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
