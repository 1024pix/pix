import sinon from 'sinon';

import { organizationLearnersController } from '../../../../../src/prescription/organization-learner/application/organization-learners-controller.js';
import { organizationLearnersRoute as moduleUnderTest } from '../../../../../src/prescription/organization-learner/application/organization-learners-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Prescription | Unit | Router | organization-learner-router', function () {
  describe('GET /api/organizations/{organizationId}/organization-learners-level-by-tubes', function () {
    const method = 'GET';

    it('should verify user privilege and organization feature access', async function () {
      // given
      sinon
        .stub(organizationLearnersController, 'getAnalysisByTubes')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'makeCheckOrganizationHasFeature')
        .callsFake(() => (request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organizations/123/organization-learners-level-by-tubes';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(securityPreHandlers.checkUserIsAdminInOrganization).to.have.been.calledBefore(
        organizationLearnersController.getAnalysisByTubes,
      );
      expect(securityPreHandlers.makeCheckOrganizationHasFeature).calledWithExactly(
        ORGANIZATION_FEATURE.COVER_RATE.key,
      );
      expect(securityPreHandlers.makeCheckOrganizationHasFeature).to.have.been.calledBefore(
        organizationLearnersController.getAnalysisByTubes,
      );
    });
  });

  describe('GET /api/organizations/{organizationId}/attestations/{attestationKey}', function () {
    const method = 'GET';

    it('should throw 403 if organization does not have feature activated', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'makeCheckOrganizationHasFeature').callsFake(
        () => (request, h) =>
          h
            .response({ errors: new Error('forbidden') })
            .code(403)
            .takeover(),
      );
      sinon
        .stub(organizationLearnersController, 'getAttestationPdfFromFilters')
        .callsFake((request, h) => h.response('ok'));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organizations/1/attestations/key';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(403);
      expect(organizationLearnersController.getAttestationPdfFromFilters).to.not.have.been.called;
    });

    it('should throw 403 if user is not admin in organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) =>
        h
          .response({ errors: new Error('forbidden') })
          .code(403)
          .takeover(),
      );
      sinon
        .stub(securityPreHandlers, 'makeCheckOrganizationHasFeature')
        .callsFake(() => (request, h) => h.response(true));
      sinon
        .stub(organizationLearnersController, 'getAttestationPdfFromFilters')
        .callsFake((request, h) => h.response('ok'));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organizations/1/attestations/key';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(403);
      expect(organizationLearnersController.getAttestationPdfFromFilters).to.not.have.been.called;
    });

    it('should call prehandlers before calling controller method', async function () {
      // given
      sinon
        .stub(organizationLearnersController, 'getAttestationPdfFromFilters')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'makeCheckOrganizationHasFeature')
        .callsFake(() => (request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organizations/1/attestations/key';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(securityPreHandlers.checkUserIsAdminInOrganization).to.have.been.calledBefore(
        organizationLearnersController.getAttestationPdfFromFilters,
      );
      expect(securityPreHandlers.makeCheckOrganizationHasFeature).calledWithExactly(
        ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key,
      );
      expect(securityPreHandlers.makeCheckOrganizationHasFeature).to.have.been.calledBefore(
        organizationLearnersController.getAttestationPdfFromFilters,
      );
    });
  });
});
