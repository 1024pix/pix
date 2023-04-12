const { expect, hFake, sinon, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

const Course = require('../../../../lib/domain/models/Course');

const courseController = require('../../../../lib/application/courses/course-controller');

describe('Unit | Controller | course-controller', function () {
  let courseServiceStub;
  let courseSerializerStub;
  beforeEach(function () {
    courseServiceStub = { getCourse: sinon.stub() };
    courseSerializerStub = { serialize: sinon.stub() };
  });

  describe('#get', function () {
    let course;

    beforeEach(function () {
      course = new Course({ id: 'course_id' });
    });

    it('should fetch and return the given course, serialized as JSONAPI', async function () {
      // given
      const userId = 42;
      courseServiceStub.getCourse.resolves(course);
      courseSerializerStub.serialize.callsFake(() => course);
      const request = {
        params: { id: 'course_id' },
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      const response = await courseController.get(request, hFake, {
        courseService: courseServiceStub,
        courseSerializer: courseSerializerStub,
      });

      // then
      expect(courseServiceStub.getCourse).to.have.been.called;
      expect(courseServiceStub.getCourse).to.have.been.calledWithExactly({ courseId: 'course_id', userId });
      expect(courseSerializerStub.serialize).to.have.been.called;
      expect(courseSerializerStub.serialize).to.have.been.calledWithExactly(course);
      expect(response).to.deep.equal(course);
    });
  });
});
