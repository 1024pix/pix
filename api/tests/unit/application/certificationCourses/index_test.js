const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const certificationCoursesController = require('../../../../lib/application/certificationCourses/certification-course-controller');

describe('Unit | Application | Certifications Course | Route', function() {

  let server;

  beforeEach(() => {
    sinon.stub(securityController, 'checkUserHasRolePixMaster').callsFake((request, reply) => reply(true));
    sinon.stub(certificationCoursesController, 'getResult').callsFake((request, reply) => reply('ok'));
    sinon.stub(certificationCoursesController, 'update').callsFake((request, reply) => reply('ok'));
    sinon.stub(certificationCoursesController, 'computeResult').callsFake((request, reply) => reply('ok'));

    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/certificationCourses') });
  });

  afterEach(() => {
    securityController.checkUserHasRolePixMaster.restore();
    certificationCoursesController.getResult.restore();
    certificationCoursesController.update.restore();
    certificationCoursesController.computeResult.restore();
  });

  describe('GET /api/admin/certifications/{id}/details', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/admin/certifications/1234/details'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });

  });

  describe('GET /api/admin/certifications/id', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/admin/certifications/1234'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('PATCH /api/certification-courses/id', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'PATCH',
        url: '/api/certification-courses/1234'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then(response => {
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
