const { expect, sinon, hFake } = require('../../../test-helper');
const Hapi = require('hapi');
const Course = require('../../../../lib/domain/models/Course');
const courseRepository = require('../../../../lib/infrastructure/repositories/course-repository');
const courseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');

const securityController = require('../../../../lib/interfaces/controllers/security-controller');
const courseController = require('../../../../lib/application/courses/course-controller');
const courseService = require('../../../../lib/domain/services/course-service');
const sessionService = require('../../../../lib/domain/services/session-service');
const certificationService = require('../../../../lib/domain/services/certification-service');
const certificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const { NotFoundError } = require('../../../../lib/domain/errors');
const { UserNotAuthorizedToCertifyError } = require('../../../../lib/domain/errors');

describe('Integration | Controller | course-controller', () => {

  let server;

  beforeEach(() => {
    sinon.stub(courseService, 'getCourse');
    sinon.stub(courseSerializer, 'serialize');
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    sinon.stub(courseRepository, 'getProgressionCourses');
    sinon.stub(courseRepository, 'getAdaptiveCourses');
    sinon.stub(courseRepository, 'getCoursesOfTheWeek');
    sinon.stub(certificationService, 'startNewCertification');
    sinon.stub(certificationCourseSerializer, 'serialize');
    sinon.stub(sessionService, 'sessionExists');

    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/courses'));
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
      courseSerializer.serialize.callsFake((_) => courses);

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
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
      courseSerializer.serialize.callsFake((_) => courses);

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
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
      courseSerializer.serialize.callsFake((_) => courses);

      // when
      const promise = server.inject(options);

      // then
      return promise.then((res) => {
        expect(res.result).to.deep.equal(courses);
      });
    });
  });

  describe('#get', () => {

    let course;

    beforeEach(() => {
      course = new Course({ 'id': 'course_id' });
    });

    it('should fetch and return the given course, serialized as JSONAPI', async () => {
      // given
      courseService.getCourse.resolves(course);
      courseSerializer.serialize.callsFake(() => course);
      const request = { params: { id: 'course_id' } };

      // when
      const response = await courseController.get(request, hFake);

      // then
      expect(courseService.getCourse).to.have.been.called;
      expect(courseService.getCourse).to.have.been.calledWith('course_id');
      expect(courseSerializer.serialize).to.have.been.called;
      expect(courseSerializer.serialize).to.have.been.calledWith(course);
      expect(response).to.deep.equal(course);
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
      return promise.then((res) => {
        expect(res.statusCode).to.equal(404);
      });
    });
  });

  describe('#save', () => {
    let request;

    const newlyCreatedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

    beforeEach(() => {
      request = {
        auth: { credentials: { accessToken: 'jwt.access.token', userId: 'userId' } },
        pre: { userId: 'userId' },
        payload: {
          data: {
            attributes: {
              'access-code': 'ABCD12'
            },
          }
        }
      };
    });

    it('should reply the certification course serialized', async () => {
      // given
      certificationService.startNewCertification.resolves(newlyCreatedCertificationCourse);
      certificationCourseSerializer.serialize.resolves({});
      sessionService.sessionExists.resolves(2);

      // when
      const response = await courseController.save(request, hFake);

      // then
      sinon.assert.calledOnce(sessionService.sessionExists);
      sinon.assert.calledWith(sessionService.sessionExists, 'ABCD12');
      sinon.assert.calledOnce(certificationCourseSerializer.serialize);
      sinon.assert.calledWith(certificationCourseSerializer.serialize, newlyCreatedCertificationCourse);
      expect(response.statusCode).to.equal(201);
    });

    it('should return 403 error if cannot start a new certification course', async () => {
      // given
      const error = new UserNotAuthorizedToCertifyError();
      certificationService.startNewCertification.rejects(error);
      certificationCourseSerializer.serialize.resolves({});
      sessionService.sessionExists.resolves();

      // when
      const response = await courseController.save(request, hFake);

      // then
      expect(response.source).to.deep.equal({
        errors: [{
          status: '403',
          detail: 'The user cannot be certified.',
          title: 'User not authorized to certify'
        }]
      });
    });
  });

});
