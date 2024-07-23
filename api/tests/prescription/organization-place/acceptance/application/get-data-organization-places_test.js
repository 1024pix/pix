import querystring from 'node:querystring';

import { createServer, expect } from '../../../../test-helper.js';

describe('Acceptance | Route | Get Data Organization Places', function () {
  describe('GET /api/data/organization-places', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const PIX_DATA_CLIENT_ID = 'pixDataCliendId';
      const PIX_DATA_CLIENT_SECRET = 'pixDataClientSecret';
      const PIX_DATA_SCOPE = 'statistics';

      const server = await createServer();

      const optionsForToken = {
        method: 'POST',
        url: `/api/application/token`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: querystring.stringify({
          grant_type: 'client_credentials',
          client_id: PIX_DATA_CLIENT_ID,
          client_secret: PIX_DATA_CLIENT_SECRET,
          scope: PIX_DATA_SCOPE,
        }),
      };
      const tokenResponse = await server.inject(optionsForToken);
      const accessToken = tokenResponse.result.access_token;

      // when
      const options = {
        method: 'GET',
        url: `/api/data/organization-places`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      };

      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
