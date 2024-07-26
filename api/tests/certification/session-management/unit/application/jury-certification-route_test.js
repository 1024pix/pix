import { juryCertificationController } from '../../../../../src/certification/session-management/application/jury-certification-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/jury-certification-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Certification | Session-management | Unit | Application | jury-certification-route', function () {
  describe('GET /api/admin/certifications/id', function () {
    it('should reject with 403 code when user is not Super Admin', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      sinon.stub(juryCertificationController, 'getJuryCertification').throws(new Error('I should not be here'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/admin/certifications/1234');

      // then
      expect(result.statusCode).to.equal(403);
      expect(juryCertificationController.getJuryCertification).to.not.have.been.called;
    });

    it('should call handler when user is admin', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(juryCertificationController, 'getJuryCertification').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/certifications/1234');

      // then
      expect(juryCertificationController.getJuryCertification).to.have.been.calledOnce;
    });

    context('when certification ID params is not a number', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/certifications/1234*');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when session ID params is out of range for database integer (> 2147483647)', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/admin/certifications/2147483648');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
