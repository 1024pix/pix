const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/certification-courses');
const certificationCoursesController = require('../../../../lib/application/certification-courses/certification-course-controller');

describe('Unit | Application | Certifications Course | Route', function () {
  describe('GET /api/admin/certifications/{id}/details', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
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
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
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
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
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
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
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
  //});

  describe('PATCH /api/certification-courses/id', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(certificationCoursesController, 'update').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/certification-courses', function () {
    it('should exist', async function () {
      // given
      sinon.stub(certificationCoursesController, 'save').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/certification-courses');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certification-courses/{id}', function () {
    it('should exist', async function () {
      // given
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
    it('should reject with 403 code when user is not Super Admin', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(certificationCoursesController, 'cancel').throws(new Error('I should not be here'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('POST', '/api/admin/certification-courses/1/cancel');

      // then
      expect(result.statusCode).to.equal(403);
      expect(certificationCoursesController.cancel).to.not.have.been.called;
    });

    it('should call handler when user is ', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
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
    it('should reject with 403 code when user is not Super Admin', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(certificationCoursesController, 'uncancel').throws(new Error('I should not be here'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('POST', '/api/admin/certification-courses/1/uncancel');

      // then
      expect(result.statusCode).to.equal(403);
      expect(certificationCoursesController.uncancel).to.not.have.been.called;
    });

    it('should call handler when user is ', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
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
