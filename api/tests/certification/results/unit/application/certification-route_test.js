import { certificationController } from '../../../../../src/certification/results/application/certification-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/results/application/certification-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Results | Unit | Application | Certification Route', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(certificationController, 'findUserCertifications').returns('ok');
    sinon.stub(certificationController, 'getCertification').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('GET /api/certifications/:id', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/certifications/1');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certifications', function () {
    it('should exist', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/certifications');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
