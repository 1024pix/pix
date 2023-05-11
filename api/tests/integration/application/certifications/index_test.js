import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { certificationController } from '../../../../lib/application/certifications/certification-controller.js';
import * as moduleUnderTest from '../../../../lib/application/certifications/index.js';

describe('Integration | Application | Route | Certifications', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(certificationController, 'findUserCertifications').returns('ok');
    sinon.stub(certificationController, 'getCertification').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/certifications', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/certifications');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certifications/:id', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/certifications/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
