const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const certificationCoursesController = require('../../../../lib/application/certification-courses/certification-course-controller');

describe('Unit | Application | Certifications Course | Route', function() {

  let server;

  beforeEach(() => {

    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(certificationCoursesController, 'getResult').returns('ok');
    sinon.stub(certificationCoursesController, 'update').returns('ok');
    sinon.stub(certificationCoursesController, 'computeResult').returns('ok');
    sinon.stub(certificationCoursesController, 'save').returns('ok');
    sinon.stub(certificationCoursesController, 'get').returns('ok');

    server = Hapi.server();

    return server.register(require('../../../../lib/application/certification-courses'));
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

  describe('POST /api/certification-courses', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'POST',
        url: '/api/certification-courses'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/certification-courses/{id}', () => {

    it('should exist', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/certification-courses/1234'
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(200);
      });
    });
  });
});
