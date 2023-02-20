import { expect, hFake, sinon, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import Course from '../../../../lib/domain/models/Course';
import courseService from '../../../../lib/domain/services/course-service';
import courseSerializer from '../../../../lib/infrastructure/serializers/jsonapi/course-serializer';
import courseController from '../../../../lib/application/courses/course-controller';

describe('Unit | Controller | course-controller', function () {
  beforeEach(function () {
    sinon.stub(courseService, 'getCourse');
    sinon.stub(courseSerializer, 'serialize');
  });

  describe('#get', function () {
    let course;

    beforeEach(function () {
      course = new Course({ id: 'course_id' });
    });

    it('should fetch and return the given course, serialized as JSONAPI', async function () {
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
