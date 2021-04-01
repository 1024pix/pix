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
    sinon.stub(certificationCoursesController, 'getCertificationResultInformation').returns('ok');
    sinon.stub(certificationCoursesController, 'update').returns('ok');
    sinon.stub(certificationCoursesController, 'computeResult').returns('ok');
    sinon.stub(certificationCoursesController, 'save').returns('ok');
    sinon.stub(certificationCoursesController, 'get').returns('ok');
    sinon.stub(certificationCoursesController, 'getCertifiedProfile').returns('ok');

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

  describe('GET /api/admin/certifications/{id}/certified-profile', () => {

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/1234/certified-profile');

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

  context('when certification ID params is not a number', () => {

    it('should return 400', async () => {

      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/1234*');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  context('when session ID params is out of range for database integer (> 2147483647)', () => {

    it('should return 400', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/admin/certifications/2147483648');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
  //});

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
