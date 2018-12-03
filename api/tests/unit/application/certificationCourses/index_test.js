const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const certificationCoursesController = require('../../../../lib/application/certificationCourses/certification-course-controller');

describe('Unit | Application | Certifications Course | Route', function() {

  let server;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sandbox.stub(certificationCoursesController, 'getResult').returns('ok');
    sandbox.stub(certificationCoursesController, 'update').returns('ok');
    sandbox.stub(certificationCoursesController, 'computeResult').returns('ok');

    server = Hapi.server();

    return server.register(require('../../../../lib/application/certificationCourses'));
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('GET /api/admin/certifications/{id}/details', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/admin/certifications/1234/details'
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });

  });

  describe('GET /api/admin/certifications/id', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/admin/certifications/1234'
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('PATCH /api/certification-courses/id', () => {

    it('should exist', async () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/certification-courses/1234'
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
