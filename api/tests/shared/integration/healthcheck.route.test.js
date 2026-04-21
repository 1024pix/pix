import sinon from 'sinon';

import { databaseConnections } from '../../../db/database-connections.js';
import { createServer } from '../../../server.js';

describe('Integration | Shared | Application | Route | healthcheck', function () {
  let server;
  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/healthcheck/db', function () {
    it('returns an HTTP status code 503 database is not available given database error message', async function () {
      sinon.stub(databaseConnections, 'checkStatuses').throws({ message: 'database error.' });
      // given
      const options = {
        method: 'GET',
        url: '/api/healthcheck/db',
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(503);
      expect(response.result.message).to.equal('Connection to databases failed: database error.');
    });
  });
});
