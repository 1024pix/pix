import sinon from 'sinon';

import { certificationCourseController } from '../../../../../src/certification/session-management/application/certification-course-controller.js';
import { certificationCourseRoute as moduleUnderTest } from '../../../../../src/certification/session-management/application/certification-course-route.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Session Management | Unit | Application | Routes | Certification Course', function () {
  describe('PATCH /api/admin/certification-courses/{certificationCourseId}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCourseController, 'update').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/reject', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/certification-courses/1/reject');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('PATCH /api/admin/certification-courses/{certificationCourseId}/unreject', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/certification-courses/1/unreject');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/certification-courses/{certificationCourseId}/edu-v3-external-jury-result', function () {
    let validPayload;

    beforeEach(function () {
      validPayload = {
        data: {
          attributes: {
            'edu-v3-external-jury-result': null,
          },
        },
      };
    });

    it('return forbidden access if user has a role that is not allowed', async function () {
      // given
      const securityPrehandlerStub = sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf');
      securityPrehandlerStub
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
        ])
        .callsFake(
          () => (request, h) =>
            h
              .response({ errors: new Error('forbidden') })
              .code(403)
              .takeover(),
        );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/certification-courses/1/edu-v3-external-jury-result',
        validPayload,
      );

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('return bad request if certification course ID is not a number ', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/certification-courses/coucou/edu-v3-external-jury-result',
        validPayload,
      );

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.stringify(response.payload)).to.includes('certificationCourseId');
      expect(JSON.stringify(response.payload)).to.includes('must be a number');
    });

    it('return bad request if extra unexpected attributes are added to the payload', async function () {
      // given
      const invalidPayload = structuredClone(validPayload);
      invalidPayload.data.attributes.coucou = 'cava';
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/certification-courses/1/edu-v3-external-jury-result',
        invalidPayload,
      );

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.stringify(response.payload)).to.includes('data.attributes.coucou');
      expect(JSON.stringify(response.payload)).to.includes('is not allowed');
    });

    it('return bad request if invalid value in edu-v3-external-jury-result', async function () {
      // given
      const invalidPayload = structuredClone(validPayload);
      invalidPayload.data.attributes['edu-v3-external-jury-result'] = 'cava';
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/certification-courses/1/edu-v3-external-jury-result',
        invalidPayload,
      );

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.stringify(response.payload)).to.includes('data.attributes.edu-v3-external-jury-result');
      expect(JSON.stringify(response.payload)).to.includes('must be one of [null, ADVANCED, EXPERT]');
    });

    it('return bad request if edu-v3-external-jury-result is empty', async function () {
      // given
      const invalidPayload = structuredClone(validPayload);
      invalidPayload.data.attributes['edu-v3-external-jury-result'] = undefined;
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/certification-courses/1/edu-v3-external-jury-result',
        invalidPayload,
      );

      // then
      expect(response.statusCode).to.equal(400);
      expect(JSON.stringify(response.payload)).to.includes('data.attributes.edu-v3-external-jury-result');
      expect(JSON.stringify(response.payload)).to.includes('is required');
    });

    [null, ...Object.values(PIX_PLUS_EDU_EXTERNAL_LEVELS)].forEach(function (eduV3Result) {
      it(`executes the handler controller when request is valid and edu-v3-external-jury-result is ${eduV3Result}`, async function () {
        // given
        validPayload.data.attributes['edu-v3-external-jury-result'] = eduV3Result;
        sinon.stub(certificationCourseController, 'updateEduV3ExternalJuryResult').returns('ok');
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/admin/certification-courses/1/edu-v3-external-jury-result',
          validPayload,
        );

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/admin/certification-courses-v3/{certificationCourseId}/details', function () {
    it('returns a 200', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
        ])
        .callsFake(() => (request, h) => h.response().code(200).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/certification-courses-v3/1/details');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
