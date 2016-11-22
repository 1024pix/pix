const Hapi = require('hapi');
const CourseController = require('../../../../lib/application/courses/course-controller');

describe('Unit | Router | CourseRouter', function () {

  let server;

  beforeEach(function () {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courses') });
  });

  function expectRouteToExist(routeOptions) {
    server.inject(routeOptions, (res) => {
      expect(res.statusCode).to.equal(200);
    });
  }

  describe('GET /api/courses', function () {

    before(function () {
      sinon.stub(CourseController, 'list', (request, reply) => reply('ok'));
    });

    after(function () {
      CourseController.list.restore();
    });

    it('should exist', function () {
      expectRouteToExist({ method: 'GET', url: '/api/courses' });
    });
  });

  describe('GET /api/courses/{id}', function () {

    before(function () {
      sinon.stub(CourseController, 'get', (request, reply) => reply('ok'));
    });

    after(function () {
      CourseController.get.restore();
    });

    it('should exist', function () {
      expectRouteToExist({ method: 'GET', url: '/api/courses/course_id' });
    });
  });

  describe('POST /api/courses/{id}', function () {

    before(function () {
      sinon.stub(CourseController, 'refresh', (request, reply) => reply('ok'));
    });

    after(function () {
      CourseController.refresh.restore();
    });

    it('should exist', function () {
      expectRouteToExist({ method: 'POST', url: '/api/courses/course_id' });
    });
  });

});
