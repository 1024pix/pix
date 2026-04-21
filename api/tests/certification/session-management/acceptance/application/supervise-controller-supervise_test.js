import { createServer } from '../../../../../server.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | Certification | Session management | session-for-supervising-controller-supervise', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  it('should return a HTTP 204 No Content', async function () {
    // given
    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
    const session = databaseBuilder.factory.buildSession({
      certificationCenterId: certificationCenter.id,
    });
    const { id: userId } = databaseBuilder.factory.buildUser();
    await databaseBuilder.commit();

    const headers = generateAuthenticatedUserRequestHeaders({ userId });

    const options = {
      headers,
      method: 'POST',
      url: '/api/sessions/supervise',
      payload: {
        data: {
          id: session.id,
          type: 'invigilator-authentications',
          attributes: {
            'session-id': session.id,
            'invigilator-password': session.invigilatorPassword,
          },
        },
      },
    };

    // when
    const response = await server.inject(options);

    // then
    const supervisedSessionInDB = await knex('invigilator_accesses').where({ userId, sessionId: session.id }).first();
    expect(supervisedSessionInDB).to.exist;
    expect(response.statusCode).to.equal(204);
  });
});
