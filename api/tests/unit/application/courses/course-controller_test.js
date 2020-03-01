const { expect, sinon, hFake, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');

const courseController = require('../../../../lib/application/courses/course-controller');
const Course = require('../../../../lib/domain/models/Demo');
const courseService = require('../../../../lib/domain/services/course-service');
const courseSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/course-serializer');

describe('Unit | Controller | course-controller', () => {

  let server;

  beforeEach(() => {
    sinon.stub(courseService, 'getCourse');
    sinon.stub(courseSerializer, 'serialize');

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

});
