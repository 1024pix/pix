const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Boom = require('boom');
const Course = require('../../../../lib/domain/models/Course');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const cache = require('../../../../lib/infrastructure/cache');

const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const courseController = require('../../../../lib/application/courses/course-controller');
const courseService = require('../../../../lib/domain/services/course-service');
const certificationService = require('../../../../lib/domain/services/certification-service');
const certificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const { NotFoundError } = require('../../../../lib/domain/errors');
const { UserNotAuthorizedToCertifyError } = require('../../../../lib/domain/errors');

describe('Integration | Controller | course-controller', () => {

  let server;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(courseService, 'getCourse');
    sandbox.stub(courseSerializer, 'serialize');
    sandbox.stub(securityController, 'checkUserHasRolePixMaster');
    sandbox.stub(courseRepository, 'refreshAll');
    sandbox.stub(courseRepository, 'getProgressionCourses');
    sandbox.stub(courseRepository, 'getAdaptiveCourses');
    sandbox.stub(courseRepository, 'getCoursesOfTheWeek');
    sandbox.stub(certificationService, 'startNewCertification');
    sandbox.stub(certificationCourseSerializer, 'serialize');
    sandbox.stub(Boom, 'forbidden');

    server = this.server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/courses') });
  });

  afterEach(() => {
    cache.flushAll();
    sandbox.restore();
  });

  describe('#list', () => {

    const courses = [
      new Course({ id: 'course_1' }),
      new Course({ id: 'course_2' }),
      new Course({ id: 'course_3' })
    ];

    it('should fetch and return all the courses', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses'
      };
      courseRepository.getProgressionCourses.resolves(courses);
      courseSerializer.serialize.callsFake(_ => courses);

      // when
      const promise = server.inject(options);

      // then
      return promise.then(res => {
        expect(res.result).to.deep.equal(courses);
      });
    });

    it('should fetch and return all the adaptive courses', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses?isAdaptive=true'
      };
      courseRepository.getAdaptiveCourses.resolves(courses);
      courseSerializer.serialize.callsFake(_ => courses);

      // when
      const promise = server.inject(options);

      // then
      return promise.then(res => {
        expect(res.result).to.deep.equal(courses);
      });
    });

    it('should fetch and return all the highlitghted courses of the week', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses?isCourseOfTheWeek=true'
      };
      courseRepository.getCoursesOfTheWeek.resolves(courses);
      courseSerializer.serialize.callsFake(_ => courses);

      // when
      const promise = server.inject(options);

      // then
      return promise.then(res => {
        expect(res.result).to.deep.equal(courses);
      });
    });
  });

  describe('#get', () => {

    let reply;
    let course;

    beforeEach(() => {
      course = new Course({ 'id': 'course_id' });
      reply = sinon.stub();
    });

    it('should fetch and return the given course, serialized as JSONAPI', () => {
      // given
      courseService.getCourse.resolves(course);
      courseSerializer.serialize.callsFake(() => course);
      const request = { params: { id: 'course_id' } };

      // when
      const promise = courseController.get(request, reply);

      // then
      return promise.then(() => {
        expect(courseService.getCourse).to.have.been.called;
        expect(courseService.getCourse).to.have.been.calledWith('course_id');
        expect(courseSerializer.serialize).to.have.been.called;
        expect(courseSerializer.serialize).to.have.been.calledWith(course);
        expect(reply).to.have.been.calledWith(course);
      });
    });

    it('should reply with error status code 404 if course not found', () => {
      // given
      const options = {
        method: 'GET',
        url: '/api/courses/unknown_id'
      };
      courseService.getCourse.rejects(new NotFoundError());

      // when
      const promise = server.inject(options);

      // then
      return promise.then(res => {
        expect(res.statusCode).to.equal(404);
      });
    });
  });

  describe('#refreshAll', () => {

    it('should return "Courses updated" when the refresh is successful', () => {
      // given
      courseRepository.refreshAll.resolves();
      const request = {};
      const reply = sinon.stub();

      // when
      const promise = courseController.refreshAll(request, reply);

      // then
      return promise.then(() => {
        expect(reply).to.have.been.calledWith('Courses updated');
      });
    });

    it('should return an internal error when the refresh is failing', () => {
      // given
      const error = new Error('An internal server error occurred');
      courseRepository.refreshAll.rejects(error);
      const request = {};
      const reply = sinon.stub();

      // when
      const promise = courseController.refreshAll(request, reply);

      // then
      return promise.then(() => {
        expect(reply).to.have.been.calledWith(error);
      });
    });
  });

  describe('#save', () => {

    let replyStub;
    let codeStub;

    const newlyCreatedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };
    const request = { auth: { credentials: { accessToken: 'jwt.access.token', userId: 'userId' } } };

    beforeEach(() => {
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({ code: codeStub });
    });

    it('should reply the certification course serialized', () => {
      // given
      certificationService.startNewCertification.resolves(newlyCreatedCertificationCourse);
      certificationCourseSerializer.serialize.resolves({});

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

    it('should return 403 error if cannot start a new certification course', () => {
      // given
      const error = new UserNotAuthorizedToCertifyError();
      certificationService.startNewCertification.rejects(error);
      Boom.forbidden.returns({ message: 'forbidden' });

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
