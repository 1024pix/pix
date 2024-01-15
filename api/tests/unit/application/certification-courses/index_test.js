import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { certificationCourseController as certificationCoursesController } from '../../../../lib/application/certification-courses/certification-course-controller.js';
import * as moduleUnderTest from '../../../../lib/application/certification-courses/index.js';

describe('Unit | Application | Certifications Course | Route', function () {
  describe('GET /api/admin/certifications/{id}/details', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCoursesController, 'getCertificationDetails').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/1234/details');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/certifications/{id}/certified-profile', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCoursesController, 'getCertifiedProfile').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/1234/certified-profile');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/certifications/id', function () {
    it('should reject with 403 code when user is not Super Admin', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      sinon.stub(certificationCoursesController, 'getJuryCertification').throws(new Error('I should not be here'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/admin/certifications/1234');

      // then
      expect(result.statusCode).to.equal(403);
      expect(certificationCoursesController.getJuryCertification).to.not.have.been.called;
    });

    it('should call handler when user is ', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCoursesController, 'getJuryCertification').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/admin/certifications/1234');

      // then
      expect(certificationCoursesController.getJuryCertification).to.have.been.calledOnce;
    });
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

  describe('PATCH /api/certification-courses/id', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCoursesController, 'update').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
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
      const response = await httpTestServer.request('PATCH', '/api/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/certification-courses', function () {
    it('should return OK (200)', async function () {
      // given
      sinon.stub(certificationCoursesController, 'save').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const method = 'POST';
      const url = '/api/certification-courses';
      const payload = {
        data: {
          attributes: {
            'access-code': 'FMKP39',
            'session-id': 2,
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certification-courses/{id}', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserOwnsCertificationCourse').returns(() => true);
      sinon.stub(certificationCoursesController, 'get').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/certification-courses/{id}/cancel', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
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
      const response = await httpTestServer.request('POST', '/api/admin/certification-courses/1/cancel');

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should call handler when user is ', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCoursesController, 'cancel').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/admin/certification-courses/1/cancel');

      // then
      expect(certificationCoursesController.cancel).to.have.been.calledOnce;
    });
  });

  describe('POST /api/admin/certification-courses/{id}/uncancel', function () {
    it('return forbidden access if user has METIER role', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
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
      const response = await httpTestServer.request('POST', '/api/admin/certification-courses/1/uncancel');

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should call handler when user is ', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(certificationCoursesController, 'uncancel').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/admin/certification-courses/1/uncancel');

      // then
      expect(certificationCoursesController.uncancel).to.have.been.calledOnce;
    });
  });
});
