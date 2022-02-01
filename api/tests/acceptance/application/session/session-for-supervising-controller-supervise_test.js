const {
  expect,
  databaseBuilder,
  domainBuilder,
  generateValidRequestAuthorizationHeader,
  sinon,
  knex,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { features } = require('../../../../lib/config');

describe('Acceptance | Controller | session-for-supervising-controller-supervise', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(function () {
    return knex('supervisor-accesses').delete();
  });

  it('should return a HTTP 204 No Content', async function () {
    // given

    const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
    const session = domainBuilder.buildSession({ id: 121, certificationCenterId: certificationCenter.id });
    session.generateSupervisorPassword();
    const supervisorPassword = session.supervisorPassword;
    databaseBuilder.factory.buildUser({ id: 3456 });
    databaseBuilder.factory.buildSession(session);
    await databaseBuilder.commit();

    sinon.stub(features, 'endTestScreenRemovalWhiteList').value([0, certificationCenter.id, 1]);
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
            'supervisor-password': supervisorPassword,
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
