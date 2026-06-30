import Sinon from 'sinon';

import { databaseConnections } from '../../../../db/database-connections.js';
import { createServer } from '../../../../server.js';
import { expect } from '../../../test-helper.js';

describe('Acceptance | Shared | Application | Route | healthcheck', function () {
  let server;
  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/healthcheck/forwarded-origin', function () {
    it('returns an HTTP status code 200 with the forwarded origin', async function () {
      // given
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/healthcheck/forwarded-origin',
        headers: { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'app.pix.org' },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.equal('https://app.pix.org');
    });
  });

  describe('GET /api/healthcheck/db', function () {
    it('returns an HTTP status code 200 when all databases are available', async function () {
      // given
      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/healthcheck/db',
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.message).to.equal('Connection to databases ok');
    });

    it('returns an HTTP status code 503 database is not available given database error message', async function () {
      // given
      Sinon.stub(databaseConnections, 'checkStatuses').throws({ message: 'database error.' });

      // when
      const response = await server.inject({
        method: 'GET',
        url: '/api/healthcheck/db',
      });

      // then
      expect(response.statusCode).to.equal(503);
      expect(response.result.message).to.equal('Connection to databases failed: database error.');
    });
  });
});
