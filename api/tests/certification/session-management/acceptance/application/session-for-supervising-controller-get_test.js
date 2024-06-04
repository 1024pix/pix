import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
} from '../../../../test-helper.js';

describe('Acceptance | Controller | Certification | Session management | session-for-supervising-controller-get', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  it('should return OK and a sessionForSupervisings type', async function () {
    // given
    databaseBuilder.factory.buildCertificationCenter({ id: 345 });
    databaseBuilder.factory.buildSession({ id: 121, certificationCenterId: 345 });
    const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId: 121 });
    databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
    databaseBuilder.factory.buildComplementaryCertification({ id: 99 });
    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      certificationCandidateId: candidate.id,
      complementaryCertificationId: 99,
    });
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
