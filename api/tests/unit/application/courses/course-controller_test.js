const { describe, it, before, afterEach, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Course = require('../../../../lib/domain/models/referential/course');
const CourseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const CourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const cache = require('../../../../lib/infrastructure/cache');

describe('Unit | Controller | course-controller', function () {

  let server;

  before(function () {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courses') });
  });

  beforeEach(function () {
    cache.flushAll();
  });

  afterEach(function () {
    cache.flushAll();
  });

  describe('#list', function () {

    const courses = [
      new Course({ "id": "course_1" }),
      new Course({ "id": "course_2" }),
      new Course({ "id": "course_3" })
    ];

    it('should fetch and return all the courses, serialized as JSONAPI', function (done) {
      // given
      sinon.stub(CourseRepository, 'list').resolves(courses);
      sinon.stub(CourseSerializer, 'serializeArray', _ => courses);

      // when
      server.inject({ method: 'GET', url: '/api/courses' }, (res) => {

        // then
        expect(res.result).to.deep.equal(courses);

        // after
        CourseRepository.list.restore();
        CourseSerializer.serializeArray.restore();
        done();
      });
    });

    it('should fetch and return all the adaptive courses, serialized as JSONAPI', function (done) {
      // given
      sinon.stub(CourseRepository, 'list').resolves(courses);
      sinon.stub(CourseSerializer, 'serializeArray', _ => courses);

      // when
      server.inject({ method: 'GET', url: '/api/courses?adaptive=true' }, (res) => {

        // then
        expect(res.result).to.deep.equal(courses);

        // after
        CourseRepository.list.restore();
        CourseSerializer.serializeArray.restore();
        done();
      });
    });
  });

  describe('#get', function () {

    const course = new Course({ "id": "course_id" });

    it('should fetch and return the given course, serialized as JSONAPI', function (done) {
      // given
      sinon.stub(CourseRepository, 'get').resolves(course);
      sinon.stub(CourseSerializer, 'serialize', _ => course);

      // when
      server.inject({ method: 'GET', url: '/api/courses/course_id' }, (res) => {

        // then
        expect(res.result).to.deep.equal(course);

        // after
        CourseRepository.get.restore();
        CourseSerializer.serialize.restore();
        done();
      });
    });

    it('should reply with error status code 404 if course not found', function (done) {
      // given
      const error = {
        "error": {
          "type": "MODEL_ID_NOT_FOUND",
          "message": "Could not find row by id unknown_id"
        }
      };
      sinon.stub(CourseRepository, 'get').rejects(error);

      // when
      server.inject({ method: 'GET', url: '/api/courses/unknown_id' }, (res) => {

        // then
        expect(res.statusCode).to.equal(404);

        // after
        CourseRepository.get.restore();
        done();
      });
    });
  });

});
