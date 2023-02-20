import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | session-for-supervising-controller-get', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  it('should return OK and a sessionForSupervisings type', async function () {
    // given
    databaseBuilder.factory.buildCertificationCenter({ id: 345 });
    databaseBuilder.factory.buildSession({ id: 121, certificationCenterId: 345 });
    databaseBuilder.factory.buildCertificationCandidate({ sessionId: 121 });
    const userId = databaseBuilder.factory.buildUser().id;
    databaseBuilder.factory.buildSupervisorAccess({ userId, sessionId: 121 });
    await databaseBuilder.commit();

    const headers = { authorization: generateValidRequestAuthorizationHeader(userId, 'pix-certif') };

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
