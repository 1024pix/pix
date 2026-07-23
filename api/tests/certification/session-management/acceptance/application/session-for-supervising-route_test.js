import { createServer } from '../../../../../server.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Session Management | Acceptance | Application | Routes | session-for-supervising', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/sessions/{sessionId}/supervising', function () {
    it('should return OK and a sessionForSupervisings type', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .sessionForSupervisingBuilder()
        .withParameters({ id: 121 })
        .insertToDB({ databaseBuilder });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildInvigilatorAccess({ userId, sessionId: 121 });
      await databaseBuilder.commit();

      const headers = generateAuthenticatedUserRequestHeaders({ userId, source: 'pix-certif' });

      const options = {
        headers,
        method: 'GET',
        url: '/api/sessions/121/supervising',
        payload: {},
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal('sessionForSupervising');
    });
  });
});
