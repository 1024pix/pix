const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Boom = require('boom');
const Course = require('../../../../lib/domain/models/Course');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const cache = require('../../../../lib/infrastructure/cache');

const courseController = require('../../../../lib/application/courses/course-controller');
const CourseService = require('../../../../lib/domain/services/course-service');
const certificationService = require('../../../../lib/domain/services/certification-service');
const certificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const { NotFoundError } = require('../../../../lib/domain/errors');
const { UserNotAuthorizedToCertifyError } = require('../../../../lib/domain/errors');

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

    let sandbox;
    let reply;
    const course = new Course({ 'id': 'course_id' });

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(CourseService, 'getCourse');
      sandbox.stub(courseSerializer, 'serialize');
      reply = sandbox.stub();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should fetch and return the given course, serialized as JSONAPI', () => {
      // given
      CourseService.getCourse.resolves(course);
      courseSerializer.serialize.callsFake(_ => course);

      const request = { params: { id: 'course_id' } };
      const promise = courseController.get(request, reply);

      // when
      return promise.then(() => {
        // then
        expect(CourseService.getCourse).to.have.been.called;
        expect(CourseService.getCourse).to.have.been.calledWith('course_id');
        expect(courseSerializer.serialize).to.have.been.called;
        expect(courseSerializer.serialize).to.have.been.calledWith(course);
        expect(reply).to.have.been.called;
      });
    });

    it('should reply with error status code 404 if course not found', () => {
      // given
      CourseService.getCourse.rejects(new NotFoundError());

      // when
      return server.inject({ method: 'GET', url: '/api/courses/unknown_id' })
        .then(res => {
          // then
          expect(res.statusCode).to.equal(404);
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

  describe('#save', function() {

    let sandbox;
    let replyStub;
    let codeStub;

    const newlyCreatedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };
    const request = { pre: { userId: 'userId' } };

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should reply the certification course serialized', function() {
      // given
      sandbox.stub(certificationService, 'startNewCertification').resolves(newlyCreatedCertificationCourse);
      sandbox.stub(certificationCourseSerializer, 'serialize').resolves({});

      // when
      const promise = courseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(certificationCourseSerializer.serialize);
        sinon.assert.calledWith(certificationCourseSerializer.serialize, newlyCreatedCertificationCourse);
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledOnce(codeStub);
        sinon.assert.calledWith(codeStub, 201);
      });
    });

    it('should return 403 error if cannot start a new certification course', function() {
      // given
      const error = new UserNotAuthorizedToCertifyError();
      sandbox.stub(certificationService, 'startNewCertification').rejects(error);
      sandbox.stub(Boom, 'forbidden').returns({ message: 'forbidden' });

      // when
      const promise = courseController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(Boom.forbidden).to.have.been.calledWith(error);
        expect(replyStub).to.have.been.calledWith({ message: 'forbidden' });
      });
    });

  });

});
