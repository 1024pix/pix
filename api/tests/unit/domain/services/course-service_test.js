import courseService from '../../../../lib/domain/services/course-service';
import courseRepository from '../../../../lib/infrastructure/repositories/course-repository';
import logger from '../../../../lib/infrastructure/logger';
import { expect, sinon } from '../../../test-helper';

describe('Unit | Service | Course Service', function () {
  describe('#getCourse', function () {
    const userId = 1;
    const learningContentCourse = { id: 'recLearningContentId' };

    beforeEach(function () {
      sinon.stub(courseRepository, 'get');
      sinon.stub(logger, 'error');
    });

    it('should call the course repository', function () {
      // given
      const givenCourseId = 'recLearningContentId';
      courseRepository.get.resolves(learningContentCourse);

      // when
      const promise = courseService.getCourse({ courseId: givenCourseId, userId });

      // then
      return promise.then(() => {
        expect(courseRepository.get).to.have.been.called;
        expect(courseRepository.get).to.have.been.calledWith(givenCourseId);
      });
    });

    context('when the course exists', function () {
      it('should return a Course from the repository', async function () {
        // given
        const courseId = 'recLearningContentId';
        const aCourse = Symbol('A course');
        courseRepository.get.withArgs(courseId).resolves(aCourse);

        // when
        const result = await courseService.getCourse({ courseId });

        // then
        expect(result).to.equal(aCourse);
      });
    });
  });
});
