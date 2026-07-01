import sinon from 'sinon';

import { attestationController } from '../../../../src/quest/application/attestation-controller.js';
import { attestationRoute } from '../../../../src/quest/application/attestation-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { ORGANIZATION_FEATURE } from '../../../../src/shared/constants.js';
import { expect } from '../../../test-helper.js';
import { AttestationTemplateFixture } from '../../../tooling/fixtures/index.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';
import {
  convertFormDataToPayload,
  generateAuthenticatedUserRequestHeaders,
} from '../../../tooling/test-utils/http-server.js';

describe('Quest | Unit | Routes | Attestation Route', function () {
  describe('POST /api/admin/attestations', function () {
    describe('when parameters are valid', function () {
      it('should call prehandler with exact parameters', async function () {
        // given
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const file = await AttestationTemplateFixture.getFile();
        const formData = new FormData();
        formData.append('templateKey', 'my_key');
        formData.append('templateName', 'my_name');
        formData.append('templateFile', new Blob([file], { type: 'application/pdf' }), 'attestation-template.pdf');
        formData.append('label', 'attestation label');

        const { payload, contentType } = await convertFormDataToPayload(formData);
        const headers = {
          'content-type': contentType,
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };

        // when
        await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        // then
        expect(securityPreHandlers.hasAtLeastOneAccessOf).to.have.been.calledOnceWithExactly([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
        ]);
      });
    });

    describe('when parameters are invalid', function () {
      it('should fail when templateKey is missing', async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const file = await AttestationTemplateFixture.getFile();
        const formData = new FormData();
        formData.append('templateName', 'my_name');
        formData.append('templateFile', new Blob([file], { type: 'application/pdf' }), 'attestation-template.pdf');
        formData.append('label', 'label');

        const { payload, contentType } = await convertFormDataToPayload(formData);
        const headers = {
          'content-type': contentType,
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        //then
        expect(response.statusCode).to.equal(400);
      });

      it('should fail when templateName is missing', async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const file = await AttestationTemplateFixture.getFile();
        const formData = new FormData();
        formData.append('templateKey', 'key');
        formData.append('templateFile', new Blob([file], { type: 'application/pdf' }), 'attestation-template.pdf');
        formData.append('label', 'label');

        const { payload, contentType } = await convertFormDataToPayload(formData);
        const headers = {
          'content-type': contentType,
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        //then
        expect(response.statusCode).to.equal(400);
      });

      it('should fail when label is missing', async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const file = await AttestationTemplateFixture.getFile();
        const formData = new FormData();
        formData.append('templateKey', 'key');
        formData.append('templateName', 'my_name');
        formData.append('templateFile', new Blob([file], { type: 'application/pdf' }), 'attestation-template.pdf');

        const { payload, contentType } = await convertFormDataToPayload(formData);
        const headers = {
          'content-type': contentType,
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        //then
        expect(response.statusCode).to.equal(400);
      });

      it('should fail when templateFile is missing', async function () {
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon.stub(attestationController, 'save').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(attestationRoute);

        const formData = new FormData();
        formData.append('templateName', 'name');
        formData.append('templateKey', 'key');
        formData.append('label', 'label');

        const { payload, contentType } = await convertFormDataToPayload(formData);
        const headers = {
          'content-type': contentType,
          ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
        };

        // when
        const response = await httpTestServer.request('POST', '/api/admin/attestations', payload, null, headers);

        //then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/organizations/{organizationId}/attestations', function () {
    it('should fail if user is not a member of the organization', async function () {
      sinon
        .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));

      const organizationId = 123;

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(attestationRoute);

      const headers = {
        ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
      };

      const response = await httpTestServer.request(
        'GET',
        `/api/organizations/${organizationId}/attestations`,
        null,
        null,
        headers,
      );

      expect(securityPreHandlers.checkUserBelongsToOrganization).to.have.been.calledOnce;
      expect(response.statusCode).to.equal(403);
    });

    it('should fail if organization does not have attestation management feature', async function () {
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'makeCheckOrganizationHasFeature').callsFake(
        () => (request, h) =>
          h
            .response({ errors: new Error('forbidden') })
            .code(403)
            .takeover(),
      );

      const organizationId = 123;

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(attestationRoute);

      const headers = {
        ...generateAuthenticatedUserRequestHeaders({ userId: 132 }),
      };

      const response = await httpTestServer.request(
        'GET',
        `/api/organizations/${organizationId}/attestations`,
        null,
        null,
        headers,
      );

      expect(securityPreHandlers.checkUserBelongsToOrganization).to.have.been.calledOnce;
      expect(securityPreHandlers.makeCheckOrganizationHasFeature).to.have.been.calledOnceWithExactly(
        ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT.key,
      );
      expect(response.statusCode).to.equal(403);
    });
  });
});
