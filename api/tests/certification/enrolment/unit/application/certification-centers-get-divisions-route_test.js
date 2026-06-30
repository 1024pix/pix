import sinon from 'sinon';

import { certificationCentersGetDivisionsRoute as moduleUnderTest } from '../../../../../src/certification/enrolment/application/certification-centers-get-divisions-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Enrolment | Unit | Router | certification-center-router', function () {
  describe('GET /api/certification-centers/{certificationCenterId}/divisions', function () {
    describe('when user is not member of certification center', function () {
      it('should return 403', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        sinon.stub(securityPreHandlers, 'checkUserIsMemberOfCertificationCenter').callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );

        // when
        const result = await httpTestServer.request('GET', '/api/certification-centers/1234/divisions');

        // then
        expect(result.statusCode).to.equal(403);
      });
    });

    it('should reject an invalid certification center id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-centers/invalid/divisions');

      // then
      expect(result.statusCode).to.equal(400);
    });
  });
});
