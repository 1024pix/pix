import { expect } from 'chai';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Controller | unfinalize', function () {
  describe('PATCH /api/admin/sessions/{sessionId}/unfinalize', function () {
    it('should return status 204', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole().id;
      databaseBuilder.factory.buildSession({ id: 123, finalizedAt: new Date('2020-01-01') });
      databaseBuilder.factory.buildFinalizedSession({ sessionId: 123 });
      await databaseBuilder.commit();

      const server = await getServer();
      const options = {
        method: 'PATCH',
        url: '/api/admin/sessions/123/unfinalize',
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      };

      // when
      const response = await server.inject(options);
      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
