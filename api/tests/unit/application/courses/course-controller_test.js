const { describe, it, before, afterEach, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Course = require('../../../../lib/domain/models/Course');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const cache = require('../../../../lib/infrastructure/cache');

describe('Unit | Controller | course-controller', function() {

  let server;

  before(function() {
    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courses') });
  });

  beforeEach(function() {
    cache.flushAll();
  });

  afterEach(function() {
    cache.flushAll();
  });

  describe('#list', function() {

    const courses = [
      new Course({ id: 'course_1' }),
      new Course({ id: 'course_2' }),
      new Course({ id: 'course_3' })
    ];

    it('should fetch and return all the courses', () => {
      // given
      sinon.stub(courseRepository, 'getProgressionCourses').resolves(courses);
      sinon.stub(courseSerializer, 'serialize').callsFake(_ => courses);

      // when
      return server.inject({ method: 'GET', url: '/api/courses' })
        .then(res => {
          // then
          expect(res.result).to.deep.equal(courses);

          // after
          courseRepository.getProgressionCourses.restore();
          courseSerializer.serialize.restore();
        });
    });

    it('should fetch and return all the adaptive courses', () => {
      // given
      sinon.stub(courseRepository, 'getAdaptiveCourses').resolves(courses);
      sinon.stub(courseSerializer, 'serialize').callsFake(_ => courses);

      // when
      return server.inject({ method: 'GET', url: '/api/courses?isAdaptive=true' })
        .then(res => {
          // then
          expect(res.result).to.deep.equal(courses);

          // after
          courseRepository.getAdaptiveCourses.restore();
          courseSerializer.serialize.restore();
        });
    });

    it('should fetch and return all the highlitghted courses of the week', () => {
      // given
      sinon.stub(courseRepository, 'getCoursesOfTheWeek').resolves(courses);
      sinon.stub(courseSerializer, 'serialize').callsFake(_ => courses);

      // when
      return server.inject({ method: 'GET', url: '/api/courses?isCourseOfTheWeek=true' })
        .then(res => {
          // then
          expect(res.result).to.deep.equal(courses);

          // after
          courseRepository.getCoursesOfTheWeek.restore();
          courseSerializer.serialize.restore();
        });
    });
  });

  describe('#get', function() {

    const course = new Course({ 'id': 'course_id' });

    it('should fetch and return the given course, serialized as JSONAPI', () => {
      // given
      sinon.stub(courseRepository, 'get').resolves(course);
      sinon.stub(courseSerializer, 'serialize').callsFake(_ => course);

      // when
      return server.inject({ method: 'GET', url: '/api/courses/course_id' })
        .then(res => {
          // then
          expect(res.result).to.deep.equal(course);

          // after
          courseRepository.get.restore();
          courseSerializer.serialize.restore();
        });
    });

    it('should reply with error status code 404 if course not found', () => {
      // given
      const error = {
        error: {
          type: 'MODEL_ID_NOT_FOUND',
          message: 'Could not find row by id unknown_id'
        }
      };
      sinon.stub(courseRepository, 'get').rejects(error);

      // when
      return server.inject({ method: 'GET', url: '/api/courses/unknown_id' })
        .then(res => {
          // then
          expect(res.statusCode).to.equal(404);

          // after
          courseRepository.get.restore();
        });
    });
  });

  describe('#refreshAll', function() {

    beforeEach(() => {
      sinon.stub(courseRepository, 'refreshAll');
    });

    afterEach(() => {
      courseRepository.refreshAll.restore();
    });

    it('should return "Courses updated" when the refresh is successful', () => {
      // given
      courseRepository.refreshAll.resolves(true);
      // when
      return server.inject({ method: 'PUT', url: '/api/courses' })
        .then(res => {
          // then
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.equal('Courses updated');
        });
    });

    it('should return an internal error when the refresh is failing', () => {
      // given
      const error = 'An internal server error occurred';
      courseRepository.refreshAll.rejects(error);

      // when
      return server.inject({ method: 'PUT', url: '/api/courses' })
        .then(res => {
          // then
          expect(res.statusCode).to.equal(500);
          expect(res.result.message).to.equal(error);
        });
    });
  });
});
