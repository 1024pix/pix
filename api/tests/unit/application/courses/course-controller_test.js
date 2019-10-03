const { expect, sinon, hFake, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const Hapi = require('hapi');

const courseController = require('../../../../lib/application/courses/course-controller');
const Course = require('../../../../lib/domain/models/Course');
const courseService = require('../../../../lib/domain/services/course-service');
const usecases = require('../../../../lib/domain/usecases');
const certificationCourseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const courseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');
const securityController = require('../../../../lib/interfaces/controllers/security-controller');

describe('Unit | Controller | course-controller', () => {

  let server;

  beforeEach(() => {
    sinon.stub(usecases, 'retrieveLastOrCreateCertificationCourse');
    sinon.stub(courseService, 'getCourse');
    sinon.stub(courseSerializer, 'serialize');
    sinon.stub(securityController, 'checkUserHasRolePixMaster');
    sinon.stub(certificationCourseSerializer, 'serialize');

    server = this.server = Hapi.server();
    return server.register(require('../../../../lib/application/courses'));
  });

  describe('#get', () => {

    let course;

    beforeEach(() => {
      course = new Course({ 'id': 'course_id' });
    });

    it('should fetch and return the given course, serialized as JSONAPI', async () => {
      // given
      const userId = 42;
      courseService.getCourse.resolves(course);
      courseSerializer.serialize.callsFake(() => course);
      const request = {
        params: { id: 'course_id' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      const response = await courseController.get(request, hFake);

      // then
      expect(courseService.getCourse).to.have.been.called;
      expect(courseService.getCourse).to.have.been.calledWithExactly({ courseId: 'course_id', userId });
      expect(courseSerializer.serialize).to.have.been.called;
      expect(courseSerializer.serialize).to.have.been.calledWithExactly(course);
      expect(response).to.deep.equal(course);
    });
  });

  describe('#save', () => {
    let request;

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

    context('when certification course needs to be created', function() {
      const newlyCreatedCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

      it('should reply the certification course serialized', async () => {
        // given
        usecases.retrieveLastOrCreateCertificationCourse
          .withArgs({ accessCode: 'ABCD12', userId: 'userId' })
          .resolves({ created: true, certificationCourse: newlyCreatedCertificationCourse });
        certificationCourseSerializer.serialize.resolves({});

        // when
        const response = await courseController.save(request, hFake);

        // then
        sinon.assert.calledOnce(certificationCourseSerializer.serialize);
        sinon.assert.calledWith(certificationCourseSerializer.serialize, newlyCreatedCertificationCourse);
        expect(response.statusCode).to.equal(201);
      });
    });

    context('when certification course already exists', function() {
      it('should reply the existing certification course', async () => {
        // given
        const existingCertificationCourse = { id: 'CertificationCourseId', nbChallenges: 3 };

        usecases.retrieveLastOrCreateCertificationCourse
          .withArgs({ accessCode: 'ABCD12', userId: 'userId' })
          .resolves({ created: false, certificationCourse: existingCertificationCourse });
        certificationCourseSerializer.serialize.resolves({});

        // when
        await courseController.save(request, hFake);

        // then
        sinon.assert.calledWith(certificationCourseSerializer.serialize, existingCertificationCourse);
      });

    });
  });

});
