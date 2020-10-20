const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const moduleUnderTest = require('../../../../lib/application/certification-courses');

const certificationCoursesController = require('../../../../lib/application/certification-courses/certification-course-controller');

describe('Unit | Application | Certifications Course | Route', function() {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(certificationCoursesController, 'getResult').returns('ok');
    sinon.stub(certificationCoursesController, 'update').returns('ok');
    sinon.stub(certificationCoursesController, 'computeResult').returns('ok');
    sinon.stub(certificationCoursesController, 'save').returns('ok');
    sinon.stub(certificationCoursesController, 'get').returns('ok');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/admin/certifications/{id}/details', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/1234/details');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/certifications/id', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/certification-courses/id', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('PATCH', '/api/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/certification-courses', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('POST', '/api/certification-courses');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/certification-courses/{id}', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/certification-courses/1234');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
