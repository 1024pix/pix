import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import * as moduleUnderTest from '../../../../../src/certification/complementary-certification/application/complementary-certification-route.js';
import { complementaryCertificationController } from '../../../../../src/certification/complementary-certification/application/complementary-certification-controller.js';

describe('Unit | Application | Certification | ComplementaryCertification | complementary-certification-route', function () {
  describe('/api/admin/complementary-certifications/{id}/target-profiles', function () {
    context('when user is an admin member', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(complementaryCertificationController, 'getComplementaryCertificationTargetProfileHistory')
          .returns('ok');
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(
          'GET',
          '/api/admin/complementary-certifications/1/target-profiles',
        );

        // then
        expect(statusCode).to.equal(200);
      });
    });

    context('when user is not an admin member', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(complementaryCertificationController, 'getComplementaryCertificationTargetProfileHistory')
          .returns('ok');
        sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns((request, h) =>
          h
            .response({ errors: new Error('') })
            .code(403)
            .takeover(),
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(
          'GET',
          '/api/admin/complementary-certifications/1/target-profiles',
        );

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});
