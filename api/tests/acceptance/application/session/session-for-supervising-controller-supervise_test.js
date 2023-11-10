import {
  expect,
  databaseBuilder,
  domainBuilder,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | Controller | session-for-supervising-controller-supervise', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  it('should return a HTTP 204 No Content', async function () {
    // given

    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({});
    const session = domainBuilder.buildSession({ id: 121, certificationCenterId: certificationCenter.id });
    databaseBuilder.factory.buildUser({ id: 3456 });
    databaseBuilder.factory.buildSession(session);
    await databaseBuilder.commit();

    const headers = { authorization: generateValidRequestAuthorizationHeader(3456, 'pix-certif') };

    const options = {
      headers,
      method: 'POST',
      url: '/api/sessions/supervise',
      payload: {
        data: {
          id: '1234',
          type: 'supervisor-authentications',
          attributes: {
            'session-id': '121',
            'supervisor-password': session.supervisorPassword,
          },
        },
      },
    };

    // when
    const response = await server.inject(options);

    // then
    const supervisedSessionInDB = await knex('supervisor-accesses').where({ userId: 3456, sessionId: 121 }).first();
    expect(supervisedSessionInDB).to.exist;
    expect(response.statusCode).to.equal(204);
  });
});
