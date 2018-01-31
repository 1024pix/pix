const { describe, it, before, afterEach, beforeEach, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Course = require('../../../../lib/domain/models/Course');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const cache = require('../../../../lib/infrastructure/cache');

const courseController = require('../../../../lib/application/courses/course-controller');
const CertificationCourseRepository = require('../../../../lib/infrastructure/repositories/certification-course-repository');
const UserService = require('../../../../lib/domain/services/user-service');
const CourseService = require('../../../../lib/domain/services/course-service');
const CertificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const CertificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const { NotFoundError } = require('../../../../lib/domain/errors');

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
    let clock;

    let sandbox;
    let replyStub;
    let codeStub;

    const certificationCourse = { id: 'CertificationCourseId' };
    const certificationCourseWithChallengesNumber = { id: 'CertificationCourseId', nbChallenges: 3 };
    const userProfile = [{ id: 'competence1', challenges: [] }];
    const request = {
      pre: {
        userId: 'userId'
      }
    };

    beforeEach(() => {
      clock = sinon.useFakeTimers(new Date('2018-02-04T01:00:00.000+01:00'));

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });

      sandbox = sinon.sandbox.create();
      sandbox.stub(CertificationCourseRepository, 'save').resolves(certificationCourse);
      sandbox.stub(UserService, 'getProfileToCertify').resolves(userProfile);
      sandbox.stub(CertificationChallengesService, 'saveChallenges').resolves(certificationCourseWithChallengesNumber);
      sandbox.stub(CertificationCourseSerializer, 'serialize').resolves({});

    });

    afterEach(() => {
      clock.restore();
      sandbox.restore();
    });

    it('should call repository to create certification-course with status "started"', function() {
      // when
      const promise = courseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationCourseRepository.save);
        sinon.assert.calledWith(CertificationCourseRepository.save, { userId: 'userId', status: 'started' });
      });
    });

    it('should call user Service to get User Certification Profile', function() {
      // when
      const promise = courseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(UserService.getProfileToCertify);
        sinon.assert.calledWith(UserService.getProfileToCertify, 'userId', '2018-02-04T00:00:00.000Z');
      });
    });

    it('should call Certification Course Service to save challenges', function() {
      // when
      const promise = courseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationChallengesService.saveChallenges);
        sinon.assert.calledWith(CertificationChallengesService.saveChallenges, userProfile, certificationCourse);
      });
    });

    it('should reply the certification course serialized', function() {
      // when
      const promise = courseController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(CertificationCourseSerializer.serialize);
        sinon.assert.calledWith(CertificationCourseSerializer.serialize, certificationCourseWithChallengesNumber);
        sinon.assert.calledOnce(replyStub);
        sinon.assert.calledOnce(codeStub);
        sinon.assert.calledWith(codeStub, 201);
      });
    });

  });

});
