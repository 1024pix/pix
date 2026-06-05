import nock from 'nock';

import { createServer } from '../../../../../server.js';
import { config } from '../../../../../src/shared/config.js';
import { cryptoService } from '../../../../../src/shared/domain/services/crypto-service.js';
import { expect } from '../../../../test-helper.js';

describe('Acceptance | Controller | Modules | Route', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/modules/v2/:shortId', function () {
    context('when a module with given shortId exist', function () {
      it('should return modules data', async function () {
        nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
        const options = {
          method: 'GET',
          url: `/api/modules/v2/9d4dcab8`,
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('modules');
      });

      context('when redirectionUrl query params is passed to api url', function () {
        it('should return module data with redirectionUrl', async function () {
          nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
          const expectedUrl = 'https://app.pix.fr/parcours/COMBINIX1';
          const encryptedRedirectionUrl = await cryptoService.encrypt(expectedUrl, config.module.secret);
          const options = {
            method: 'GET',
            url: `/api/modules/v2/9d4dcab8?encryptedRedirectionUrl=${encodeURIComponent(encryptedRedirectionUrl)}`,
          };

          const response = await server.inject(options);

          expect(response.statusCode).to.equal(200);
          expect(response.result.data.attributes['redirection-url']).to.equal(expectedUrl);
        });
      });
    });
  });

  describe('GET /api/module-schema/module-json-schema.json', function () {
    it('should return a cacheable JSON Schema', async function () {
      const options = {
        method: 'GET',
        url: '/api/module-schema/module-json-schema.json',
      };

      const response = await server.inject(options);

      expect(response.statusCode).to.equal(200);
      expect(response.headers['cache-control']).to.include('public');
      expect(response.headers['cache-control']).to.include(config.module.jsonSchemaCacheMaxAge);
      expect(response.headers['etag']).to.exist;
      expect(() => JSON.parse(response.payload), 'Response payload is not a valid JSON string').not.to.throw(Error);
    });
  });
});
