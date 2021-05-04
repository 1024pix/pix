const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

const moduleUnderTest = require('../../../../lib/application/certifications');

const certificationController = require('../../../../lib/application/certifications/certification-controller');

describe('Integration | Application | Route | Certifications', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(certificationController, 'findUserCertifications').returns('ok');
    sinon.stub(certificationController, 'getCertification').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/certifications', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/certifications');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certifications/:id', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/certifications/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
